import { forbiddenResponse } from '../utils/response.js';

// Role-based access control middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(
        res,
        `Access denied. Required roles: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return forbiddenResponse(res, 'Admin access required');
  }
};

// Check if user is vendor
export const isVendor = (req, res, next) => {
  if (req.user && req.user.role === 'VENDOR') {
    next();
  } else {
    return forbiddenResponse(res, 'Vendor access required');
  }
};

// Check if user is procurement officer
export const isProcurementOfficer = (req, res, next) => {
  if (req.user && req.user.role === 'PROCUREMENT_OFFICER') {
    next();
  } else {
    return forbiddenResponse(res, 'Procurement Officer access required');
  }
};

// Check if user is finance manager
export const isFinanceManager = (req, res, next) => {
  if (req.user && req.user.role === 'FINANCE_MANAGER') {
    next();
  } else {
    return forbiddenResponse(res, 'Finance Manager access required');
  }
};

// Check if user owns the resource (for vendor profile, etc.)
export const isOwnerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.userId === req.params.userId)) {
    next();
  } else {
    return forbiddenResponse(res, 'Access denied');
  }
};
