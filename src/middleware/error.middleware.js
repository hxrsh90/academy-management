class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  if (err.name === 'ValidationError' && err.details) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: err.message,
      details: err.details
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: 'Resource already exists'
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'FOREIGN_KEY_VIOLATION',
      message: 'Referenced resource does not exist'
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name || 'ERROR',
      message: err.message
    });
  }

  return res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'Something went wrong'
  });
};

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler
};
