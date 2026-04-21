import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [mode, setMode] = useState('password');
  const [formData, setFormData] = useState({ mobile: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { login, verifyOTP } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/otp/send', { mobile: formData.mobile });
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'password') {
        await login({ mobile: formData.mobile, password: formData.password });
      } else {
        await verifyOTP(formData.mobile, formData.otp);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Academy Management</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex mb-4">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 ${mode === 'password' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setMode('otp'); setOtpSent(false); }}
            className={`flex-1 py-2 ${mode === 'otp' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            OTP
          </button>
        </div>

        <form onSubmit={otpSent ? handleSubmit : mode === 'password' ? handleSubmit : handleSendOTP}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="10 digit mobile number"
              maxLength="10"
              required
            />
          </div>

          {mode === 'password' && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          )}

          {mode === 'otp' && otpSent && (
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter 6 digit OTP"
                maxLength="6"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'otp' && !otpSent ? 'Send OTP' : 'Login'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
