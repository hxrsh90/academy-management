import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    mobile: '', email: '', password: '', role: 'coach'
  });

  const canManage = user?.role === 'super_admin';

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' ? '/users' : `/users?role=${filter}`;
      const response = await api.get(url);
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setFormData({ ...formData, password: pwd });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/users', formData);
      setCreatedCreds({
        mobile: formData.mobile,
        password: formData.password,
        role: formData.role,
        name: response.data.data?.email || formData.mobile
      });
      setFormData({ mobile: '', email: '', password: '', role: 'coach' });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Only Super Admins can manage users.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Coach/Admin
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {['all', 'admin', 'coach', 'super_admin'].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-lg capitalize ${filter === r ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {r.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4">{u.id}</td>
                  <td className="px-6 py-4">{u.mobile}</td>
                  <td className="px-6 py-4">{u.email || '-'}</td>
                  <td className="px-6 py-4 capitalize">{u.role?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Mobile (10 digits) *</label>
                <input
                  type="tel"
                  maxLength="10"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password * (min 8 chars)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded"
                    minLength="8"
                    required
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Display Modal */}
      {createdCreds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-2 text-green-700">User Created!</h2>
            <p className="text-sm text-gray-600 mb-4">
              Share these credentials with the {createdCreds.role}. <strong>This password will not be shown again.</strong>
            </p>
            <div className="bg-gray-50 p-4 rounded mb-4 space-y-2 text-sm">
              <div><strong>Role:</strong> {createdCreds.role}</div>
              <div className="flex items-center justify-between">
                <div><strong>Mobile:</strong> {createdCreds.mobile}</div>
                <button onClick={() => copyToClipboard(createdCreds.mobile)} className="text-xs text-blue-600">Copy</button>
              </div>
              <div className="flex items-center justify-between">
                <div><strong>Password:</strong> <code className="bg-yellow-100 px-2 py-1 rounded">{createdCreds.password}</code></div>
                <button onClick={() => copyToClipboard(createdCreds.password)} className="text-xs text-blue-600">Copy</button>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(`Login credentials:\nMobile: ${createdCreds.mobile}\nPassword: ${createdCreds.password}\nLogin at: ${window.location.origin}/login`)}
              className="w-full mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy Message for WhatsApp/SMS
            </button>
            <button
              onClick={() => setCreatedCreds(null)}
              className="w-full px-4 py-2 bg-gray-200 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
