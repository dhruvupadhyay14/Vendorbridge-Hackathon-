import jwt from 'jsonwebtoken';

// Generate JWT Token
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

// Decode JWT Token (without verification)
export const decodeToken = (token) => {
  return jwt.decode(token);
};

// Generate Refresh Token (optional - for extended sessions)
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};
