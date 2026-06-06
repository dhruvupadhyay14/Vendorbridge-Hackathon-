import { verifyToken } from '../utils/jwt.js';
import { unauthorizedResponse } from '../utils/response.js';

// Auth middleware to verify JWT token
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return unauthorizedResponse(res, error.message);
    }
  } catch (error) {
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = verifyToken(token);
        req.user = decoded;
      } catch (error) {
        console.log('Optional auth token invalid:', error.message);
      }
    }
    next();
  } catch (error) {
    next();
  }
};
