/**
 * Authentication Module Constants and Configuration
 */

// ============== TOKEN CONFIGURATION ==============

export const TOKEN_CONFIG = {
  // Access token validity
  ACCESS_TOKEN_EXPIRY: '7d',
  
  // Refresh token validity
  REFRESH_TOKEN_EXPIRY: '30d',
  
  // Password reset token validity (in hours)
  PASSWORD_RESET_EXPIRY: 1,
  
  // Email verification token validity (in hours)
  EMAIL_VERIFICATION_EXPIRY: 24,
};

// ============== PASSWORD CONFIGURATION ==============

export const PASSWORD_CONFIG = {
  // Minimum password length
  MIN_LENGTH: 8,
  
  // Bcrypt salt rounds
  SALT_ROUNDS: 10,
  
  // Password regex pattern
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  
  // Password regex for enhanced security (with special chars)
  ENHANCED_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
};

// ============== EMAIL CONFIGURATION ==============

export const EMAIL_CONFIG = {
  // Email verification deadline (hours)
  VERIFICATION_DEADLINE: 24,
  
  // Password reset deadline (hours)
  PASSWORD_RESET_DEADLINE: 1,
  
  // Max email verification attempts
  MAX_VERIFICATION_ATTEMPTS: 3,
  
  // Email resend interval (minutes)
  EMAIL_RESEND_INTERVAL: 5,
};

// ============== VALIDATION CONSTRAINTS ==============

export const VALIDATION_CONSTRAINTS = {
  // Name constraints
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  
  // Email constraints
  EMAIL_MAX_LENGTH: 255,
  
  // Phone constraints
  PHONE_MAX_LENGTH: 20,
  
  // Department constraints
  DEPARTMENT_MAX_LENGTH: 100,
  
  // Bio constraints
  BIO_MAX_LENGTH: 500,
  
  // URL constraints
  URL_MAX_LENGTH: 500,
};

// ============== USER ROLES ==============

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER',
  MANAGER: 'MANAGER',
  VENDOR: 'VENDOR',
};

// ============== USER STATUS ==============

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING: 'PENDING',
};

// ============== ERROR MESSAGES ==============

export const ERROR_MESSAGES = {
  // Registration errors
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_EMAIL_FORMAT: 'Invalid email format',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  
  // Login errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_ACTIVE: 'Account is not active',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  
  // Password errors
  CURRENT_PASSWORD_INVALID: 'Current password is incorrect',
  PASSWORD_SAME_AS_CURRENT: 'New password must be different from current password',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // Token errors
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  
  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_NOT_AUTHENTICATED: 'User not authenticated',
  
  // Email errors
  EMAIL_SEND_FAILED: 'Failed to send email',
  VERIFICATION_TOKEN_INVALID: 'Invalid or expired verification token',
  
  // Validation errors
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
};

// ============== SUCCESS MESSAGES ==============

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'User registered successfully. Please check your email to verify.',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PASSWORD_RESET: 'Password reset successful. Please login with your new password',
  EMAIL_VERIFIED: 'Email verified successfully',
  RESET_EMAIL_SENT: 'Password reset link sent to your email',
};

// ============== EMAIL TEMPLATES ==============

export const EMAIL_TEMPLATES = {
  VERIFICATION_SUBJECT: 'Verify your VendorBridge account',
  PASSWORD_RESET_SUBJECT: 'Reset your VendorBridge password',
  WELCOME_SUBJECT: 'Welcome to VendorBridge',
};

// ============== RATE LIMITING ==============

export const RATE_LIMITING = {
  // Authentication endpoints
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  AUTH_MAX_REQUESTS: 5,
  
  // General API endpoints
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: 100,
  
  // Password reset
  PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  PASSWORD_RESET_MAX_REQUESTS: 3,
};

// ============== SECURITY SETTINGS ==============

export const SECURITY_SETTINGS = {
  // Session timeout (in seconds)
  SESSION_TIMEOUT: 24 * 60 * 60, // 24 hours
  
  // Max failed login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Lockout duration (in minutes)
  LOCKOUT_DURATION: 15,
  
  // Password history (don't allow reuse of last N passwords)
  PASSWORD_HISTORY_COUNT: 5,
  
  // Password expiry (in days, 0 = never)
  PASSWORD_EXPIRY_DAYS: 0,
  
  // Force password change on first login
  FORCE_PASSWORD_CHANGE: false,
};

// ============== HTTP STATUS CODES ==============

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// ============== ACTIVITY TYPES ==============

export const ACTIVITY_TYPES = {
  REGISTRATION: 'REGISTRATION',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET: 'PASSWORD_RESET',
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  EMAIL_RESEND: 'EMAIL_RESEND',
  FAILED_LOGIN: 'FAILED_LOGIN',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
};

/**
 * Get user display name
 */
export const getUserDisplayName = (user) => {
  return `${user.firstName} ${user.lastName}`.trim();
};

/**
 * Check if password meets requirements
 */
export const isPasswordStrong = (password) => {
  return PASSWORD_CONFIG.PATTERN.test(password) && 
         password.length >= PASSWORD_CONFIG.MIN_LENGTH;
};

/**
 * Check if password meets enhanced security requirements
 */
export const isPasswordEnhanced = (password) => {
  return PASSWORD_CONFIG.ENHANCED_PATTERN.test(password) && 
         password.length >= PASSWORD_CONFIG.MIN_LENGTH;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    ADMIN: 'Administrator',
    PROCUREMENT_OFFICER: 'Procurement Officer',
    MANAGER: 'Manager',
    VENDOR: 'Vendor',
  };
  return roleNames[role] || role;
};

/**
 * Get user status display name
 */
export const getStatusDisplayName = (status) => {
  const statusNames = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    PENDING: 'Pending',
  };
  return statusNames[status] || status;
};

/**
 * Check if user can reset password
 */
export const canResetPassword = (user) => {
  return user && user.status !== 'PENDING';
};

/**
 * Check if user can login
 */
export const canLogin = (user) => {
  return user && user.status === 'ACTIVE' && user.isEmailVerified;
};

/**
 * Sanitize user object for response
 */
export const sanitizeUserData = (user) => {
  const { password, emailVerificationToken, passwordResetToken, ...sanitized } = user;
  return sanitized;
};
