import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdMsg({ type: 'success', text: 'Password changed successfully' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => { setShowPwdModal(false); setPwdMsg({ type: '', text: '' }); }, 1500);
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-home' },
    { path: '/students', label: 'Students', icon: 'fa-users' },
    { path: '/batches', label: 'Batches', icon: 'fa-layer-group' },
    { path: '/classes', label: 'Classes', icon: 'fa-chalkboard' },
    { path: '/attendance', label: 'Attendance', icon: 'fa-clipboard-check' },
    { path: '/payments', label: 'Payments', icon: 'fa-rupee-sign' },
    ...(user?.role === 'admin' || user?.role === 'super_admin' ? [
      { path: '/reports', label: 'Reports', icon: 'fa-chart-bar' },
      { path: '/import', label: 'Bulk Import', icon: 'fa-file-import' }
    ] : []),
    ...(user?.role === 'super_admin' ? [{ path: '/users', label: 'Users', icon: 'fa-user-shield' }] : [])
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">Academy Mgmt</h1>
          <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
        </div>
        
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-gray-700 transition-colors ${
                isActive(item.path) ? 'bg-blue-600' : ''
              }`}
            >
              <i className={`fas ${item.icon} w-6`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-300">{user?.email || user?.mobile}</p>
          </div>
          <button
            onClick={() => { setShowPwdModal(true); setPwdMsg({ type: '', text: '' }); }}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition-colors mb-2"
          >
            <i className="fas fa-key w-6"></i>
            <span>Change Password</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 rounded transition-colors"
          >
            <i className="fas fa-sign-out-alt w-6"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Change Password Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Change Password</h2>
            {pwdMsg.text && (
              <div className={`px-3 py-2 rounded mb-3 text-sm ${pwdMsg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {pwdMsg.text}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-gray-700">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  minLength="8"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  minLength="8"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowPwdModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
