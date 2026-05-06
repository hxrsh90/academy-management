const { logger, sanitizeData } = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    body: sanitizeData(req.body),
    query: req.query
  });
  
  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.responseData = data;
    originalSend.apply(this, arguments);
  };
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    });
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Request error', {
    method: req.method,
    path: req.path,
    statusCode: err.statusCode || 500,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    ip: req.ip || req.connection.remoteAddress,
    body: sanitizeData(req.body)
  });
  
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};
