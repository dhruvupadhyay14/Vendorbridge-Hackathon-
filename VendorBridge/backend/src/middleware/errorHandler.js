// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = {};

  // Express validation errors
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    message = 'Validation Error';
    details.errors = err.array();
  }

  // MongoDB Cast Error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    details.field = field;
  }

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `${field} already exists`;
    details.field = field;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Foreign key constraint failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // File upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large';
    } else if (err.code === 'FILE_TOO_LARGE') {
      message = 'File size exceeds limit';
    } else {
      message = 'File upload error';
    }
  }

  // Development mode: include stack trace
  if (process.env.NODE_ENV === 'development') {
    details.stack = err.stack;
  }

  // Send error response
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (Object.keys(details).length > 0) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Async error wrapper class
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
