import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse, createdResponse, badRequestResponse, unauthorizedResponse, serverErrorResponse } from '../../utils/response.js';
import * as authService from './auth.service.js';

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // Check if user already exists
  const existingUser = await authService.findUserByEmail(email);
  if (existingUser) {
    return badRequestResponse(res, 'Email already registered');
  }

  // Call service to create user
  const user = await authService.createUser({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || 'VENDOR',
  });

  // Send verification email
  try {
    await authService.sendVerificationEmail(user.email, user.firstName);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }

  return createdResponse(
    res,
    'User registered successfully. Please check your email to verify.',
    {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  );
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await authService.findUserByEmail(email);
  if (!user) {
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    return unauthorizedResponse(res, `Account is ${user.status.toLowerCase()}`);
  }

  // Verify password
  const isPasswordValid = await authService.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  // Generate tokens
  const tokens = await authService.generateTokens(user);

  // Update last login
  await authService.updateLastLogin(user.id);

  return successResponse(res, 'Login successful', {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage,
    },
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  });
});

/**
 * Refresh access token
 * POST /auth/refresh-token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return badRequestResponse(res, 'Refresh token is required');
  }

  try {
    const tokens = await authService.refreshAccessToken(refreshToken);
    return successResponse(res, 'Token refreshed successfully', {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return unauthorizedResponse(res, error.message || 'Invalid refresh token');
  }
});

/**
 * Forgot password - send reset email
 * POST /auth/forgot-password
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await authService.findUserByEmail(email);
  if (!user) {
    // Don't reveal if email exists for security
    return successResponse(res, 'If email exists, password reset link will be sent');
  }

  // Generate reset token
  const resetToken = await authService.generatePasswordResetToken(user.id);

  // Send reset email
  try {
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await authService.sendPasswordResetEmail(user.email, user.firstName, resetLink);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return serverErrorResponse(res, 'Error sending reset email');
  }

  return successResponse(
    res,
    'If email exists, password reset link will be sent',
    { email: user.email }
  );
});

/**
 * Reset password using token
 * POST /auth/reset-password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return badRequestResponse(res, 'Token and new password are required');
  }

  try {
    await authService.resetUserPassword(token, newPassword);
    return successResponse(res, 'Password reset successful. Please login with your new password');
  } catch (error) {
    return badRequestResponse(res, error.message);
  }
});

/**
 * Get current user profile
 * GET /auth/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;

  const user = await authService.findUserById(userId);
  if (!user) {
    return unauthorizedResponse(res, 'User not found');
  }

  // Get vendor info if user is vendor
  let vendor = null;
  if (user.role === 'VENDOR') {
    vendor = await authService.getVendorByUserId(userId);
  }

  return successResponse(res, 'Profile fetched successfully', {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      department: user.department,
      role: user.role,
      profileImage: user.profileImage,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    vendor: vendor ? {
      id: vendor.id,
      companyName: vendor.companyName,
      companyLogo: vendor.companyLogo,
      ratingScore: vendor.ratingScore,
    } : null,
  });
});

/**
 * Update user profile
 * PUT /auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, phone, department, bio, profileImage } = req.body;

  const updatedUser = await authService.updateUserProfile(userId, {
    firstName,
    lastName,
    phone,
    department,
    bio,
    profileImage,
  });

  return successResponse(res, 'Profile updated successfully', {
    id: updatedUser.id,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phone: updatedUser.phone,
    department: updatedUser.department,
    profileImage: updatedUser.profileImage,
    bio: updatedUser.bio,
  });
});

/**
 * Change password
 * POST /auth/change-password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return badRequestResponse(res, 'Current and new password are required');
  }

  try {
    await authService.changeUserPassword(userId, currentPassword, newPassword);
    return successResponse(res, 'Password changed successfully');
  } catch (error) {
    return badRequestResponse(res, error.message);
  }
});

/**
 * Verify email using token
 * POST /auth/verify-email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return badRequestResponse(res, 'Verification token is required');
  }

  try {
    await authService.verifyUserEmail(token);
    return successResponse(res, 'Email verified successfully');
  } catch (error) {
    return badRequestResponse(res, error.message);
  }
});

/**
 * Logout user
 * POST /auth/logout
 */
export const logout = asyncHandler(async (req, res) => {
  // Token invalidation can be handled by client removing the token
  // Or implement token blacklist if needed
  return successResponse(res, 'Logged out successfully');
});
