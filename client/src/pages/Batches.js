import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Batches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', description: '', sportType: 'football', skillLevel: 'beginner',
    coachId: '', capacity: 30, startDate: '', endDate: ''
  });

  const canManage = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    fetchBatches();
    fetchCoaches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      let url = '/batches';
      const params = [];
      if (search) params.push(`search=${search}`);
      if (filter !== 'all') params.push(`status=${filter}`);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get(url);
      setBatches(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/users?role=coach');
      setCoaches(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/batches', formData);
      setFormData({
        name: '', description: '', sportType: 'football', skillLevel: 'beginner',
        coachId: '', capacity: 30, startDate: '', endDate: ''
      });
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batches</h1>
        {canManage && (
          <button
            onClick={() => { setShowModal(true); setError(''); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Batch
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search batches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg flex-1"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <div
              key={batch.id}
              onClick={() => navigate(`/batches/${batch.id}`)}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{batch.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  batch.status === 'active' ? 'bg-green-100 text-green-800' :
                  batch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {batch.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2 capitalize">{batch.sport_type} • {batch.skill_level}</p>
              {batch.coach_name && <p className="text-sm text-gray-500 mb-2">Coach: {batch.coach_name}</p>}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{batch.enrolled_count || 0} / {batch.capacity} students</span>
                {batch.start_date && <span>Starts: {new Date(batch.start_date).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">No batches found</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Batch</h2>
            {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Batch Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Sport Type</label>
                  <select
                    value={formData.sportType}
                    onChange={(e) => setFormData({ ...formData, sportType: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="cricket">Cricket</option>
                    <option value="tennis">Tennis</option>
                    <option value="swimming">Swimming</option>
                    <option value="athletics">Athletics</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skill Level</label>
                  <select
                    value={formData.skillLevel}
                    onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Coach</label>
                <select
                  value={formData.coachId}
                  onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">-- Select Coach --</option>
                  {coaches.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name || c.email || c.mobile}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
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
    </div>
  );
};

export default Batches;
