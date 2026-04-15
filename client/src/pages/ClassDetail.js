import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ClassDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, [id]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const [classRes, studentsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/classes/${id}/students`)
      ]);
      setClassData(classRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      const response = await api.get('/students?status=active&limit=1000');
      const enrolledIds = students.map(s => s.id);
      setAvailableStudents(response.data.data.filter(s => !enrolledIds.includes(s.id)));
      setShowAddModal(true);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const addStudent = async (studentId) => {
    try {
      await api.post(`/classes/${id}/students`, { student_id: studentId });
      fetchClassData();
      setShowAddModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const removeStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the class?')) return;
    try {
      await api.delete(`/classes/${id}/students/${studentId}`);
      fetchClassData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove student');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classData) {
    return <div className="p-6">Class not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/classes" className="text-blue-600 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i>Back to Classes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{classData.name}</h1>
            <p className="text-gray-500 capitalize">{classData.sport_type} - {classData.skill_level} level</p>
            <div className="flex gap-4 mt-2 text-sm">
              <span><i className="fas fa-calendar mr-1"></i> {classData.day_of_week}</span>
              <span><i className="fas fa-clock mr-1"></i> {classData.start_time?.slice(0,5)} - {classData.end_time?.slice(0,5)}</span>
              <span><i className="fas fa-map-marker-alt mr-1"></i> {classData.venue || 'TBD'}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded text-sm ${classData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {classData.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p><strong>Coach:</strong> {classData.coach_first_name || 'Unassigned'} {classData.coach_last_name || ''}</p>
          <p><strong>Capacity:</strong> {classData.current_enrolled} / {classData.capacity} students</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Enrolled Students</h2>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <button
            onClick={fetchAvailableStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>Add Student
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Mobile</th>
              <th className="px-4 py-3 text-left">Enrolled Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t">
                <td className="px-4 py-3">
                  <Link to={`/students/${student.id}`} className="text-blue-600 hover:underline">
                    {student.first_name} {student.last_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{student.mobile}</td>
                <td className="px-4 py-3">{new Date(student.enrollment_date).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <button
                      onClick={() => removeStudent(student.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-8 text-center text-gray-500">No students enrolled yet</div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Student to Class</h2>
            {availableStudents.length > 0 ? (
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-500">{student.mobile} | {student.skill_level}</p>
                    </div>
                    <button
                      onClick={() => addStudent(student.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No available students to add</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;
