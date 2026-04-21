import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [showAddStudent, setShowAddStudent] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    fetchBatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'classes') fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, id]);

  const fetchBatchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/batches/${id}`);
      setBatch(response.data.data);
    } catch (err) {
      console.error('Failed to fetch batch:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/batches/${id}/students`);
      setStudents(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get(`/batches/${id}/classes`);
      setClasses(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from batch?')) return;
    try {
      await api.delete(`/batches/${id}/students/${studentId}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!batch) return <div className="p-6">Batch not found</div>;

  return (
    <div className="p-6">
      <button onClick={() => navigate('/batches')} className="text-blue-600 mb-4 hover:underline">
        ← Back to Batches
      </button>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{batch.name}</h1>
            <p className="text-gray-600 mb-2">{batch.description || 'No description'}</p>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="capitalize">{batch.sport_type}</span>
              <span className="capitalize">{batch.skill_level}</span>
              <span className={`px-2 py-0.5 rounded ${batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                {batch.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            {batch.coach_name && <p className="text-sm text-gray-600">Coach: {batch.coach_name}</p>}
            <p className="text-sm text-gray-500">{batch.enrolled_count || 0} / {batch.capacity} students</p>
            {(batch.start_date || batch.end_date) && (
              <p className="text-xs text-gray-400 mt-1">
                {batch.start_date && new Date(batch.start_date).toLocaleDateString()}
                {batch.start_date && batch.end_date && ' - '}
                {batch.end_date && new Date(batch.end_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-2 px-4 ${activeTab === 'students' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Students ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-2 px-4 ${activeTab === 'classes' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Classes ({classes.length})
        </button>
      </div>

      {activeTab === 'students' && (
        <div>
          {canManage && (
            <button
              onClick={() => setShowAddStudent(true)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Student
            </button>
          )}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                  {canManage && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-4">{s.id}</td>
                    <td className="px-6 py-4">{s.first_name} {s.last_name}</td>
                    <td className="px-6 py-4">{s.mobile}</td>
                    <td className="px-6 py-4 capitalize">{s.skill_level}</td>
                    <td className="px-6 py-4">{new Date(s.enrollment_date).toLocaleDateString()}</td>
                    {canManage && (
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={canManage ? 6 : 5} className="text-center py-8 text-gray-500">No students enrolled</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div>
          {canManage && (
            <button
              onClick={() => navigate('/classes', { state: { batchId: id } })}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Class for This Batch
            </button>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/classes/${c.id}`)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer border border-gray-200"
              >
                <h3 className="font-semibold mb-1">{c.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{c.day_of_week} • {c.start_time?.substring(0, 5)} - {c.end_time?.substring(0, 5)}</p>
                <p className="text-sm text-gray-400 mt-1">{c.venue}</p>
              </div>
            ))}
            {classes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">No classes scheduled for this batch</div>
            )}
          </div>
        </div>
      )}

      {/* Add Student Modal - placeholder, would need student search */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Student to Batch</h2>
            <p className="text-gray-600 mb-4">Go to Students page to add students to this batch.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddStudent(false)} className="px-4 py-2 bg-gray-200 rounded">Close</button>
              <button
                onClick={() => { setShowAddStudent(false); navigate('/students'); }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Go to Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;
