const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

const registerValidation = [
  body('mobile').notEmpty().withMessage('Mobile is required').matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'parent', 'coach', 'admin']).withMessage('Invalid role'),
  body('firstName').if(body('role').equals('student')).notEmpty().withMessage('First name is required for students'),
  body('lastName').if(body('role').equals('student')).notEmpty().withMessage('Last name is required for students'),
  validate
];

const loginValidation = [
  body('mobile').optional().matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const otpValidation = [
  body('mobile').notEmpty().matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  validate
];

const verifyOtpValidation = [
  body('mobile').notEmpty().matches(/^\d{10}$/).withMessage('Invalid mobile number'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  validate
];

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/otp/send', otpValidation, authController.sendOTP);
router.post('/otp/verify', verifyOtpValidation, authController.verifyOTP);
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
