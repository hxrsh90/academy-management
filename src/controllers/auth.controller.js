const authService = require('../services/auth.service');
const { ValidationError } = require('../middleware/error.middleware');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result,
      message: 'Login successful'
    });
  } catch (error) {
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
    res.json({
      success: true,
      data: result,
      message: 'OTP sent successfully'
    });
  } catch (error) {
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
    res.json({
      success: true,
      data: result,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const result = await authService.changePassword(userId, currentPassword, newPassword);
    res.json({
      success: true,
      data: result,
      message: 'Password changed successfully'
    });
  } catch (error) {
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
