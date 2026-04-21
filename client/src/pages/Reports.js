import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      fetchReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dateRange]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (activeTab) {
        case 'attendance':
          endpoint = `/reports/attendance?from_date=${dateRange.from}&to_date=${dateRange.to}`;
          break;
        case 'payments':
          endpoint = `/reports/payments?from_date=${dateRange.from}&to_date=${dateRange.to}`;
          break;
        case 'enrollment':
          endpoint = `/reports/enrollment?from_date=${dateRange.from}&to_date=${dateRange.to}`;
          break;
        default:
          return;
      }
      const response = await api.get(endpoint);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
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

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Students" value={stats?.totalStudents} icon="fa-users" color="bg-blue-500" />
        <StatCard title="Active Classes" value={stats?.totalClasses} icon="fa-chalkboard" color="bg-green-500" />
        <StatCard title="Coaches" value={stats?.totalCoaches} icon="fa-user-tie" color="bg-purple-500" />
        <StatCard title="Today's Attendance" value={stats?.todayAttendance} icon="fa-clipboard-check" color="bg-orange-500" />
        <StatCard title="Pending Payments" value={stats?.pendingPayments} icon="fa-rupee-sign" color="bg-red-500" />
        <StatCard title="Monthly Revenue" value={`₹${stats?.monthlyRevenue}`} icon="fa-chart-line" color="bg-teal-500" />
      </div>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Attendance Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {reportData?.summary?.map((item) => (
          <div key={item.status} className="bg-gray-50 p-4 rounded text-center">
            <p className="text-2xl font-bold capitalize">{item.count}</p>
            <p className="text-sm text-gray-500 capitalize">{item.status}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentsReport = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Payment Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Fee Type</th>
              <th className="px-4 py-2 text-right">Total Amount</th>
              <th className="px-4 py-2 text-right">Count</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.summary?.map((item) => (
              <tr key={item.fee_type} className="border-t">
                <td className="px-4 py-2 capitalize">{item.fee_type}</td>
                <td className="px-4 py-2 text-right font-medium">₹{item.total}</td>
                <td className="px-4 py-2 text-right">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEnrollmentReport = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4">Enrollment Trends</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Month</th>
              <th className="px-4 py-2 text-right">New Enrollments</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.monthly?.map((item) => (
              <tr key={item.month} className="border-t">
                <td className="px-4 py-2">{new Date(item.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                <td className="px-4 py-2 text-right">{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="flex gap-4 mb-6">
        {['dashboard', 'attendance', 'payments', 'enrollment'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'dashboard' && (
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-bold mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border rounded"
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && stats && renderDashboard()}
          {activeTab === 'attendance' && renderAttendanceReport()}
          {activeTab === 'payments' && renderPaymentsReport()}
          {activeTab === 'enrollment' && renderEnrollmentReport()}
        </>
      )}
    </div>
  );
};

export default Reports;
