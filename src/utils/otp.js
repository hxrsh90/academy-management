const crypto = require('crypto');

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (mobile, otp) => {
  const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES) || 10) * 60 * 1000;
  otpStore.set(mobile, { otp, expiresAt, attempts: 0 });
};

const verifyOTP = (mobile, inputOtp) => {
  const record = otpStore.get(mobile);
  
  if (!record) {
    return { valid: false, message: 'OTP not found or expired' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return { valid: false, message: 'OTP expired' };
  }

  if (record.attempts >= 5) {
    otpStore.delete(mobile);
    return { valid: false, message: 'Too many failed attempts' };
  }

  record.attempts++;

  if (record.otp !== inputOtp) {
    return { valid: false, message: 'Invalid OTP' };
  }

  otpStore.delete(mobile);
  return { valid: true };
};

const canSendOTP = (mobile) => {
  const record = otpStore.get(mobile);
  if (!record) return true;
  
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentAttempts = Array.from(otpStore.entries()).filter(
    ([key, value]) => key === mobile && value.expiresAt > oneHourAgo
  );
  
  return recentAttempts.length < 3;
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  canSendOTP
};
