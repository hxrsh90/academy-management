import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <i className={`fas ${icon} text-white`}></i>
        </div>
      </div>
    </div>
  );

  if (user?.role === 'student') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user?.student?.first_name || 'Student'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/classes" className="block p-3 bg-blue-50 rounded hover:bg-blue-100">
                <i className="fas fa-chalkboard mr-2"></i> View My Classes
              </a>
              <a href="/attendance" className="block p-3 bg-green-50 rounded hover:bg-green-100">
                <i className="fas fa-clipboard-check mr-2"></i> Check Attendance
              </a>
              <a href="/payments" className="block p-3 bg-yellow-50 rounded hover:bg-yellow-100">
                <i className="fas fa-rupee-sign mr-2"></i> View Payments
              </a>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">My Profile</h2>
            <p><strong>Mobile:</strong> {user?.mobile}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Students" value={stats.totalStudents} icon="fa-users" color="bg-blue-500" />
          <StatCard title="Active Classes" value={stats.totalClasses} icon="fa-chalkboard" color="bg-green-500" />
          <StatCard title="Coaches" value={stats.totalCoaches} icon="fa-user-tie" color="bg-purple-500" />
          <StatCard title="Today's Attendance" value={stats.todayAttendance} icon="fa-clipboard-check" color="bg-orange-500" />
          <StatCard title="Pending Payments" value={stats.pendingPayments} icon="fa-rupee-sign" color="bg-red-500" />
          <StatCard title="Monthly Revenue" value={`₹${stats.monthlyRevenue}`} icon="fa-chart-line" color="bg-teal-500" />
        </div>
      ) : (
        <p>Failed to load dashboard stats</p>
      )}
    </div>
  );
};

export default Dashboard;
