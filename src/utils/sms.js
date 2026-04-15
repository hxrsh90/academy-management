const twilio = require('twilio');

let twilioClient = null;

if (process.env.SMS_PROVIDER === 'twilio' && 
    process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (error) {
    console.warn('Twilio initialization failed, using mock mode:', error.message);
    twilioClient = null;
  }
}

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
    return { success: true, sid: 'mock-sid' };
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to.startsWith('+') ? to : `+91${to}`
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error);
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
