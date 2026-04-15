import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
      fetchAttendance();
    }
  }, [selectedClass, selectedDate]);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await api.get(`/classes/${selectedClass}/students`);
      setStudents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attendance/class?class_id=${selectedClass}&date=${selectedDate}`);
      const attendanceMap = {};
      response.data.data.forEach(record => {
        attendanceMap[record.student_id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const records = students.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || 'absent',
        notes: ''
      }));
      
      await api.post('/attendance/bulk', {
        classId: parseInt(selectedClass),
        date: selectedDate,
        records
      });
      
      alert('Attendance saved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusButtonClass = (studentId, status) => {
    const currentStatus = attendance[studentId];
    const baseClass = 'px-3 py-1 rounded text-sm font-medium ';
    if (currentStatus === status) {
      const colors = {
        present: 'bg-green-500 text-white',
        absent: 'bg-red-500 text-white',
        late: 'bg-yellow-500 text-white',
        excused: 'bg-blue-500 text-white'
      };
      return baseClass + colors[status];
    }
    return baseClass + 'bg-gray-200 text-gray-700 hover:bg-gray-300';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} - {cls.sport_type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={saveAttendance}
              disabled={!selectedClass || saving}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {selectedClass && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-center">Present</th>
                  <th className="px-4 py-3 text-center">Absent</th>
                  <th className="px-4 py-3 text-center">Late</th>
                  <th className="px-4 py-3 text-center">Excused</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-sm">
                            {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-gray-500">{student.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                        className={getStatusButtonClass(student.id, 'present')}
                      >
                        <i className="fas fa-check mr-1"></i>Present
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                        className={getStatusButtonClass(student.id, 'absent')}
                      >
                        <i className="fas fa-times mr-1"></i>Absent
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                        className={getStatusButtonClass(student.id, 'late')}
                      >
                        <i className="fas fa-clock mr-1"></i>Late
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleAttendanceChange(student.id, 'excused')}
                        className={getStatusButtonClass(student.id, 'excused')}
                      >
                        <i className="fas fa-file-medical mr-1"></i>Excused
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">No students enrolled in this class</div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <i className="fas fa-clipboard-check text-4xl mb-4 text-gray-300"></i>
          <p>Select a class and date to mark attendance</p>
        </div>
      )}
    </div>
  );
};

export default Attendance;
