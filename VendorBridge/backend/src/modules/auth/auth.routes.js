import express from 'express';
import { validationResult } from 'express-validator';
import { authenticate } from '../../middleware/authMiddleware.js';
import * as authController from './auth.controller.js';
import * as authValidation from './auth.validation.js';

const router = express.Router();

/**
 * Validation error handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// ============== PUBLIC ROUTES ==============

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
  '/register',
  authValidation.registerValidation(),
  handleValidationErrors,
  authController.register
);

/**
 * POST /auth/login
 * Login user and get JWT tokens
 */
router.post(
  '/login',
  authValidation.loginValidation(),
  handleValidationErrors,
  authController.login
);

/**
 * POST /auth/refresh-token
 * Refresh access token using refresh token
 */
router.post(
  '/refresh-token',
  authValidation.refreshTokenValidation(),
  handleValidationErrors,
  authController.refreshToken
);

/**
 * POST /auth/forgot-password
 * Send password reset email
 */
router.post(
  '/forgot-password',
  authValidation.forgotPasswordValidation(),
  handleValidationErrors,
  authController.forgotPassword
);

/**
 * POST /auth/reset-password
 * Reset password using reset token
 */
router.post(
  '/reset-password',
  authValidation.resetPasswordValidation(),
  handleValidationErrors,
  authController.resetPassword
);

/**
 * POST /auth/verify-email
 * Verify email using verification token
 */
router.post(
  '/verify-email',
  authValidation.verifyEmailValidation(),
  handleValidationErrors,
  authController.verifyEmail
);

// ============== PROTECTED ROUTES (Requires Authentication) ==============

/**
 * GET /auth/profile
 * Get current user profile
 */
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

/**
 * PUT /auth/profile
 * Update current user profile
 */
router.put(
  '/profile',
  authenticate,
  authValidation.updateProfileValidation(),
  handleValidationErrors,
  authController.updateProfile
);

/**
 * POST /auth/change-password
 * Change password (requires authentication)
 */
router.post(
  '/change-password',
  authenticate,
  authValidation.changePasswordValidation(),
  handleValidationErrors,
  authController.changePassword
);

/**
 * POST /auth/logout
 * Logout user (requires authentication)
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

export default router;
