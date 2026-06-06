import prisma from '../../config/database.js';
import { hashPassword, comparePassword } from '../../utils/bcrypt.js';
import { generateToken, verifyToken, decodeToken } from '../../utils/jwt.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../../utils/nodemailer.js';
import crypto from 'crypto';

// ============== USER CREATION & AUTHENTICATION ==============

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  const { email, password, firstName, lastName, phone, role } = userData;

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'VENDOR',
        status: 'ACTIVE',
        emailVerificationToken,
        emailVerificationExpiresAt,
      },
    });

    return user;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Email already registered');
    }
    throw error;
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

/**
 * Find user by ID
 */
export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

/**
 * Find user with vendor details
 */
export const findUserWithVendor = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      vendor: true,
    },
  });
};

// ============== PASSWORD MANAGEMENT ==============

/**
 * Verify password
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await comparePassword(plainPassword, hashedPassword);
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = async (userId) => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const passwordResetExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: resetTokenHash,
      passwordResetExpiresAt,
    },
  });

  return resetToken;
};

/**
 * Reset user password
 */
export const resetUserPassword = async (resetToken, newPassword) => {
  // Hash the provided token to match with database
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: resetTokenHash,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  // Log activity
  await createActivityLog(user.id, 'UPDATE', 'User', user.id, 'Password reset');
};

/**
 * Change user password
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  // Find user
  const user = await findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Ensure new password is different
  if (currentPassword === newPassword) {
    throw new Error('New password must be different from current password');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Log activity
  await createActivityLog(userId, 'UPDATE', 'User', userId, 'Password changed');
};

// ============== EMAIL VERIFICATION ==============

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, firstName) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to VendorBridge, ${firstName}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Please check your email for verification link to activate your account.</p>
      <p>Best regards,<br>VendorBridge Team</p>
    </div>
  `;

  await sendWelcomeEmail(email, firstName);
};

/**
 * Verify user email
 */
export const verifyUserEmail = async (token) => {
  // Find user with valid verification token
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  // Update user email verification status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  // Log activity
  await createActivityLog(user.id, 'UPDATE', 'User', user.id, 'Email verified');
};

// ============== TOKEN MANAGEMENT ==============

/**
 * Generate access and refresh tokens
 */
export const generateTokens = async (user) => {
  const accessToken = generateToken(user.id, user.email, user.role);
  const refreshToken = generateToken(user.id, user.email, user.role);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Find user
    const user = await findUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const tokens = await generateTokens(user);

    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// ============== USER PROFILE ==============

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  const { firstName, lastName, phone, department, bio, profileImage } = updateData;

  // Build update object, only including provided fields
  const dataToUpdate = {};
  if (firstName !== undefined) dataToUpdate.firstName = firstName;
  if (lastName !== undefined) dataToUpdate.lastName = lastName;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (department !== undefined) dataToUpdate.department = department;
  if (bio !== undefined) dataToUpdate.bio = bio;
  if (profileImage !== undefined) dataToUpdate.profileImage = profileImage;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error('No data to update');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  // Log activity
  await createActivityLog(userId, 'UPDATE', 'User', userId, 'Profile updated', dataToUpdate);

  return updatedUser;
};

// ============== VENDOR ==============

/**
 * Get vendor by user ID
 */
export const getVendorByUserId = async (userId) => {
  return await prisma.vendor.findUnique({
    where: { userId },
  });
};

// ============== ACTIVITY TRACKING ==============

/**
 * Create activity log
 */
export const createActivityLog = async (userId, type, entity, entityId, action, changes = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type,
        entity,
        entityId,
        action,
        newValues: changes ? JSON.stringify(changes) : null,
      },
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// ============== LOGIN TRACKING ==============

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (userId) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// ============== PASSWORD RESET EMAIL ==============

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, firstName, resetLink) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${firstName},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p><strong>Note:</strong> This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Best regards,<br>VendorBridge Team</p>
    </div>
  `;

  await sendPasswordResetEmail(email, 'Password Reset Request', htmlContent);
};

// ============== USER STATUS ==============

/**
 * Check if user exists
 */
export const userExists = async (email) => {
  const user = await findUserByEmail(email);
  return !!user;
};

/**
 * Get user count
 */
export const getUserCount = async (role = null) => {
  const where = role ? { role } : {};
  return await prisma.user.count({ where });
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  return await prisma.user.findMany({
    where: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      status: true,
      createdAt: true,
    },
  });
};
