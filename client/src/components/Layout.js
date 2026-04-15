import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-home' },
    { path: '/students', label: 'Students', icon: 'fa-users' },
    { path: '/classes', label: 'Classes', icon: 'fa-chalkboard' },
    { path: '/attendance', label: 'Attendance', icon: 'fa-clipboard-check' },
    { path: '/payments', label: 'Payments', icon: 'fa-rupee-sign' },
    ...(user?.role === 'admin' || user?.role === 'super_admin' ? [{ path: '/reports', label: 'Reports', icon: 'fa-chart-bar' }] : [])
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
    </div>
  );
};

export default Layout;
