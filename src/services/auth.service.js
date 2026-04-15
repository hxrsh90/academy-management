const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const studentModel = require('../models/student.model');
const { generateTokens } = require('../utils/jwt');
const { generateOTP, storeOTP, verifyOTP, canSendOTP } = require('../utils/otp');
const { sendOTP } = require('../utils/sms');
const { ConflictError, UnauthorizedError, ValidationError, NotFoundError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

const register = async (userData) => {
  const { email, mobile, password, role, firstName, lastName, ...studentData } = userData;

  const existingUser = await userModel.findByMobile(mobile);
  if (existingUser) {
    throw new ConflictError('Mobile number already registered');
  }

  if (email) {
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await userModel.create({
    email,
    mobile,
    passwordHash,
    role: role || 'student'
  });

  let student = null;
  if (role === 'student' && firstName && lastName) {
    student = await studentModel.create({
      userId: user.id,
      firstName,
      lastName,
      ...studentData
    });
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    },
    student,
    tokens
  };
};

const login = async (credentials) => {
  const { email, mobile, password } = credentials;

  let user;
  if (email) {
    user = await userModel.findByEmail(email);
  } else if (mobile) {
    user = await userModel.findByMobile(mobile);
  }

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (user.status !== 'active') {
    throw new UnauthorizedError('Account is not active');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  let student = null;
  if (user.role === 'student') {
    student = await studentModel.findByUserId(user.id);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    },
    student,
    tokens
  };
};

const sendLoginOTP = async (mobile) => {
  if (!canSendOTP(mobile)) {
    throw new ValidationError('Too many OTP requests. Please try again later.');
  }

  const user = await userModel.findByMobile(mobile);
  if (!user) {
    throw new NotFoundError('Mobile number not registered');
  }

  const otp = generateOTP();
  storeOTP(mobile, otp);

  await sendOTP(mobile, otp);

  return { message: 'OTP sent successfully' };
};

const verifyLoginOTP = async (mobile, otp) => {
  const verification = verifyOTP(mobile, otp);
  if (!verification.valid) {
    throw new UnauthorizedError(verification.message);
  }

  const user = await userModel.findByMobile(mobile);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.status !== 'active') {
    throw new UnauthorizedError('Account is not active');
  }

  await userModel.update(user.id, { mobile_verified_at: new Date() });

  const tokens = generateTokens(user.id, user.email, user.role);

  let student = null;
  if (user.role === 'student') {
    student = await studentModel.findByUserId(user.id);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status
    },
    student,
    tokens
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await userModel.update(userId, { password_hash: newPasswordHash });

  return { message: 'Password changed successfully' };
};

module.exports = {
  register,
  login,
  sendLoginOTP,
  verifyLoginOTP,
  changePassword
};
