import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'cash', feeType: 'monthly', notes: ''
  });

  useEffect(() => {
    fetchPayments();
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPayments = async () => {
    try {
      const params = user?.role === 'student' ? `?student_id=${user?.student?.id}` : '';
      const response = await api.get(`/payments${params}`);
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students?limit=1000');
      setStudents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount),
        studentId: parseInt(formData.studentId)
      });
      setShowModal(false);
      setFormData({
        studentId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'cash', feeType: 'monthly', notes: ''
      });
      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const getStatusColor = (status) => {
    const colors = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', 
                     overdue: 'bg-red-100 text-red-800', refunded: 'bg-gray-100 text-gray-800' };
    return colors[status] || 'bg-gray-100';
  };

  const getFeeTypeColor = (type) => {
    const colors = { monthly: 'bg-blue-100 text-blue-800', quarterly: 'bg-purple-100 text-purple-800', 
                     admission: 'bg-orange-100 text-orange-800', uniform: 'bg-pink-100 text-pink-800', 
                     event: 'bg-teal-100 text-teal-800' };
    return colors[type] || 'bg-gray-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payments</h1>
        {(user?.role === 'admin' || user?.role === 'super_admin') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <i className="fas fa-plus mr-2"></i>Record Payment
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Mode</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {payment.student_first_name} {payment.student_last_name}
                  </td>
                  <td className="px-4 py-3 font-medium">₹{payment.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${getFeeTypeColor(payment.fee_type)}`}>
                      {payment.fee_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{payment.payment_mode}</td>
                  <td className="px-4 py-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="p-8 text-center text-gray-500">No payments found</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Student *</label>
                <select value={formData.studentId} onChange={(e) => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded" required>
                  <option value="">Select Student</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.mobile})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Amount (₹) *</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border rounded" min="0" step="0.01" required />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Payment Mode</label>
                  <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Fee Type</label>
                  <select value={formData.feeType} onChange={(e) => setFormData({...formData, feeType: e.target.value})} className="w-full px-3 py-2 border rounded">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="admission">Admission</option>
                    <option value="uniform">Uniform</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Payment Date</label>
                <input type="date" value={formData.paymentDate} onChange={(e) => setFormData({...formData, paymentDate: e.target.value})} className="w-full px-3 py-2 border rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border rounded" rows="2"></textarea>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded">Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
