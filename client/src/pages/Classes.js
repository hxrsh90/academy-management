import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '', sportType: '', skillLevel: 'beginner', dayOfWeek: 'monday',
    startTime: '', endTime: '', capacity: 20, venue: '', coachId: ''
  });
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    fetchClasses();
    fetchCoaches();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/users?role=coach');
      setCoaches(response.data.data);
    } catch (error) {
      console.error('Failed to fetch coaches:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/classes', formData);
      setShowModal(false);
      setFormData({ name: '', sportType: '', skillLevel: 'beginner', dayOfWeek: 'monday',
        startTime: '', endTime: '', capacity: 20, venue: '', coachId: '' });
      fetchClasses();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>Add Class
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{cls.name}</h3>
                  <p className="text-gray-500 capitalize">{cls.sport_type}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${cls.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cls.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <p><i className="fas fa-clock mr-2 text-gray-400"></i>{cls.day_of_week}, {cls.start_time?.slice(0,5)} - {cls.end_time?.slice(0,5)}</p>
                <p><i className="fas fa-map-marker-alt mr-2 text-gray-400"></i>{cls.venue || 'TBD'}</p>
                <p><i className="fas fa-users mr-2 text-gray-400"></i>{cls.current_enrolled} / {cls.capacity} students</p>
                <p><i className="fas fa-user-tie mr-2 text-gray-400"></i>Coach: {cls.coach_first_name || 'Unassigned'} {cls.coach_last_name || ''}</p>
              </div>

              <Link to={`/classes/${cls.id}`} className="block text-center bg-gray-100 py-2 rounded hover:bg-gray-200">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Class</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Class Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Sport Type *</label>
                <input type="text" value={formData.sportType} onChange={(e) => setFormData({...formData, sportType: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="e.g. Football, Swimming" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Skill Level</label>
                  <select value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Day *</label>
                  <select value={formData.dayOfWeek} onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})} className="w-full px-3 py-2 border rounded">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'multiple'].map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Start Time *</label>
                  <input type="time" value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">End Time *</label>
                  <input type="time" value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Venue</label>
                <input type="text" value={formData.venue} onChange={(e) => setFormData({...formData, venue: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Capacity</label>
                <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full px-3 py-2 border rounded" min="1" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Coach</label>
                <select value={formData.coachId} onChange={(e) => setFormData({...formData, coachId: e.target.value ? parseInt(e.target.value) : ''})} className="w-full px-3 py-2 border rounded">
                  <option value="">Select Coach</option>
                  {coaches.map(coach => (
                    <option key={coach.id} value={coach.id}>{coach.first_name} {coach.last_name} ({coach.mobile})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
