const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT_SECRET is required - no fallback for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Please set it in your .env file.');
}

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Provide more specific error messages
    if (error.name === 'JsonWebTokenError') {
      if (error.message === 'invalid signature') {
        throw new Error('Token signature is invalid. This usually means the token was signed with a different secret. Please log in again.');
      }
      throw new Error('Invalid token. Please log in again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired. Please log in again.');
    }
    throw error;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};

