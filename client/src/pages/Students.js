import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    mobile: '', email: '', password: '', firstName: '', lastName: '',
    dateOfBirth: '', gender: 'male', skillLevel: 'beginner'
  });

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students?page=${page}&limit=10&search=${search}`);
      setStudents(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      setShowModal(false);
      setFormData({ mobile: '', email: '', password: '', firstName: '', lastName: '',
        dateOfBirth: '', gender: 'male', skillLevel: 'beginner' });
      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create student');
    }
  };

  const getStatusColor = (status) => {
    const colors = { active: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800', 
                     graduated: 'bg-blue-100 text-blue-800', dropout: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2"></i>Add Student
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border rounded-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Skill Level</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Enrolled</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{student.first_name} {student.last_name}</td>
                    <td className="px-4 py-3">{student.mobile}</td>
                    <td className="px-4 py-3 capitalize">{student.skill_level}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(student.enrollment_status)}`}>
                        {student.enrollment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(student.enrollment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link to={`/students/${student.id}`} className="text-blue-600 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">First Name *</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Last Name *</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-3 py-2 border rounded" required />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Mobile *</label>
                <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} className="w-full px-3 py-2 border rounded" maxLength="10" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Password *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded" minLength="8" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Date of Birth</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Gender</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Skill Level</label>
                <select value={formData.skillLevel} onChange={(e) => setFormData({...formData, skillLevel: e.target.value})} className="w-full px-3 py-2 border rounded">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
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

export default Students;
