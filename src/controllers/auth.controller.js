const authService = require('../services/auth.service');
const { ValidationError } = require('../middleware/error.middleware');
const { logger, sanitizeData } = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    logger.info('User registered successfully', { 
      userId: result.user.id, 
      email: result.user.email,
      role: result.user.role 
    });
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // SECURITY FIX: Do not log request body as it contains password
    logger.info('Login attempt', { 
      email: req.body.email || undefined,
      mobile: req.body.mobile || undefined 
    });
    const result = await authService.login(req.body);
    logger.info('Login successful', { 
      userId: result.user.id,
      role: result.user.role 
    });
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
    logger.warn('Login failed', { 
      error: error.message,
      email: req.body.email || undefined,
      mobile: req.body.mobile || undefined 
    });
    next(error);
  }
};

const sendOTP = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      throw new ValidationError('Mobile number is required');
    }
    const result = await authService.sendLoginOTP(mobile);
    logger.info('OTP sent successfully', { mobile });
    res.json({
      success: true,
      data: result,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    logger.warn('OTP send failed', { mobile: req.body.mobile, error: error.message });
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      throw new ValidationError('Mobile and OTP are required');
    }
    const result = await authService.verifyLoginOTP(mobile, otp);
    logger.info('OTP verified successfully', { mobile, userId: result.user.id });
    res.json({
      success: true,
      data: result,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    logger.warn('OTP verification failed', { mobile, error: error.message });
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    logger.info('Password changed successfully', { userId });
    res.json({
      success: true,
      data: result,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.warn('Password change failed', { userId, error: error.message });
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: { user: req.user },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  sendOTP,
  verifyOTP,
  changePassword,
  getProfile
};
