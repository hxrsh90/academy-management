const twilio = require('twilio');
const { logger } = require('./logger');

let twilioClient = null;

if (process.env.SMS_PROVIDER === 'twilio' && 
    process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    logger.info('Twilio client initialized successfully');
  } catch (error) {
    logger.warn('Twilio initialization failed, using mock mode', { error: error.message });
    twilioClient = null;
  }
}

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    logger.info('[SMS Mock] Sending SMS', { to, message });
    return { success: true, sid: 'mock-sid' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith('+') ? to : `+91${to}`
    });
    logger.info('SMS sent successfully via Twilio', { to, sid: result.sid });
    return { success: true, sid: result.sid };
  } catch (error) {
    logger.error('SMS sending failed', { to, error: error.message });
    throw new Error('Failed to send SMS');
  }
};

const sendOTP = async (mobile, otp) => {
  const message = `Your Academy verification code is: ${otp}. Valid for 10 minutes.`;
  return sendSMS(mobile, message);
};

const sendPaymentReminder = async (mobile, studentName, amount) => {
  const message = `Reminder: Payment of Rs.${amount} pending for ${studentName}. Please visit the academy to complete payment.`;
  return sendSMS(mobile, message);
};

module.exports = {
  sendSMS,
  sendOTP,
  sendPaymentReminder
};
