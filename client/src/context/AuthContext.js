import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { tokens, user, student } = response.data.data;
    localStorage.setItem('token', tokens.accessToken);
    setUser({ ...user, student });
    setIsAuthenticated(true);
    return response.data.data;
  };

  const verifyOTP = async (mobile, otp) => {
    const response = await api.post('/auth/otp/verify', { mobile, otp });
    const { tokens, user, student } = response.data.data;
    localStorage.setItem('token', tokens.accessToken);
    setUser({ ...user, student });
    setIsAuthenticated(true);
    return response.data.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { tokens, user, student } = response.data.data;
    localStorage.setItem('token', tokens.accessToken);
    setUser({ ...user, student });
    setIsAuthenticated(true);
    return response.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    verifyOTP
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
