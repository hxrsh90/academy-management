import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [dataLoaded, setDataLoaded] = useState({ info: false, classes: false, attendance: false, payments: false, membership: false });

  useEffect(() => {
    fetchStudentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!dataLoaded[activeTab] && activeTab !== 'info') {
      fetchTabData(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${id}`);
      setStudent(response.data.data);
      setDataLoaded(prev => ({ ...prev, info: true }));
    } catch (error) {
      console.error('Failed to fetch student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    try {
      setTabLoading(true);
      let response;
      switch (tab) {
        case 'classes':
          response = await api.get(`/students/${id}/classes`);
          setClasses(response.data.data);
          break;
        case 'attendance':
          response = await api.get(`/students/${id}/attendance?limit=20`);
          setAttendance(response.data.data);
          break;
        case 'payments':
          response = await api.get(`/students/${id}/payments?limit=20`);
          setPayments(response.data.data);
          break;
        default:
          break;
      }
      setDataLoaded(prev => ({ ...prev, [tab]: true }));
    } catch (error) {
      console.error(`Failed to fetch ${tab} data:`, error);
    } finally {
      setTabLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }

  const getStatusColor = (status) => {
    const colors = { active: 'bg-green-100 text-green-800', paused: 'bg-yellow-100 text-yellow-800', 
                     graduated: 'bg-blue-100 text-blue-800', dropout: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/students" className="text-blue-600 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i>Back to Students
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-blue-600 font-bold">
              {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{student.first_name} {student.last_name}</h1>
            <p className="text-gray-500">{student.email} | {student.mobile}</p>
            <div className="flex gap-4 mt-2">
              <span className={`px-3 py-1 rounded text-sm ${getStatusColor(student.enrollment_status)}`}>
                {student.enrollment_status}
              </span>
              <span className="px-3 py-1 rounded text-sm bg-blue-100 text-blue-800 capitalize">
                {student.skill_level}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        {['info', 'membership', 'classes', 'attendance', 'payments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            disabled={tabLoading && activeTab !== tab}
          >
            {tab}
            {tabLoading && activeTab === tab && <span className="ml-2 inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Date of Birth:</strong> {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Gender:</strong> <span className="capitalize">{student.gender || 'N/A'}</span></div>
            <div><strong>Blood Group:</strong> {student.blood_group || 'N/A'}</div>
            <div><strong>Enrollment Date:</strong> {new Date(student.enrollment_date).toLocaleDateString()}</div>
            <div><strong>SPOC:</strong> {student.spoc || 'N/A'}</div>
            <div><strong>Sport:</strong> {student.sport || 'N/A'}</div>
            <div><strong>Plan:</strong> {student.plan || 'N/A'}</div>
            <div className="col-span-2"><strong>Emergency Contact:</strong> {student.emergency_contact_name || 'N/A'} {student.emergency_contact_phone && `(${student.emergency_contact_phone})`}</div>
            {student.medical_info && (
              <div className="col-span-2"><strong>Medical Info:</strong> {student.medical_info}</div>
            )}
            {student.remarks && (
              <div className="col-span-2"><strong>Remarks:</strong> {student.remarks}</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'membership' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Date of Joining:</strong> {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Date of Payment:</strong> {student.date_of_payment ? new Date(student.date_of_payment).toLocaleDateString() : 'N/A'}</div>
            <div><strong>Additional Days:</strong> {student.additional_days || 0}</div>
            <div><strong>Last Day of Membership:</strong> {student.last_membership_date ? new Date(student.last_membership_date).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold text-lg mb-4">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Registration Fees:</strong> ₹{student.registration_fees || 0}</div>
              <div><strong>Discount on Registration:</strong> ₹{student.discount_registration || 0}</div>
              <div><strong>Membership Amount:</strong> ₹{student.membership_amount || 0}</div>
              <div><strong>Discount on Membership:</strong> ₹{student.discount_membership || 0}</div>
              <div><strong>Sibling/Referral Discount:</strong> ₹{student.sibling_discount || 0}</div>
              <div className="col-span-2 bg-blue-50 p-4 rounded">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹{student.total_amount || 0}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">₹{student.membership_paid || 0}</div>
                    <div className="text-sm text-gray-600">Paid</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">₹{student.pending_amount || 0}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </div>
              {student.pending_paid_on && (
                <div className="col-span-2"><strong>Pending Amount to be Paid On:</strong> {new Date(student.pending_paid_on).toLocaleDateString()}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Class Name</th>
                <th className="px-4 py-3 text-left">Sport</th>
                <th className="px-4 py-3 text-left">Schedule</th>
                <th className="px-4 py-3 text-left">Coach</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => (
                <tr key={cls.id} className="border-t">
                  <td className="px-4 py-3">{cls.name}</td>
                  <td className="px-4 py-3 capitalize">{cls.sport_type}</td>
                  <td className="px-4 py-3">{cls.day_of_week}, {cls.start_time?.slice(0,5)}</td>
                  <td className="px-4 py-3">{cls.coach_first_name} {cls.coach_last_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {classes.length === 0 && <div className="p-8 text-center text-gray-500">Not enrolled in any classes</div>}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{record.class_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-4 py-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{payment.amount}</td>
                  <td className="px-4 py-3 capitalize">{payment.fee_type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <div className="p-8 text-center text-gray-500">No payment records</div>}
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
