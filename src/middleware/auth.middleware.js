const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('./error.middleware');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT id, email, mobile, role, status FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('User not found');
    }

    const user = result.rows[0];
    
    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }
    next(error);
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

module.exports = { authenticate, authorize };
