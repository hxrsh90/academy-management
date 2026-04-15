const paymentModel = require('../models/payment.model');
const studentModel = require('../models/student.model');
const { NotFoundError } = require('../middleware/error.middleware');

const findAll = async (filters, page, limit) => {
  return await paymentModel.findAll(filters, page, limit);
};

const findById = async (id) => {
  const payment = await paymentModel.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  return payment;
};

const create = async (data, recordedBy) => {
  const student = await studentModel.findById(data.studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const fieldMapping = {
    studentId: 'student_id',
    amount: 'amount',
    paymentDate: 'payment_date',
    paymentMode: 'payment_mode',
    invoiceNumber: 'invoice_number',
    feeType: 'fee_type',
    receiptUrl: 'receipt_url',
    notes: 'notes'
  };

  const createData = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldMapping[key]) {
      createData[fieldMapping[key]] = value;
    }
  }
  createData.recorded_by = recordedBy;

  return await paymentModel.create(createData);
};

const update = async (id, data) => {
  const payment = await paymentModel.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  const allowedFields = ['amount', 'payment_date', 'payment_mode', 'fee_type', 'status', 'receipt_url', 'notes'];
  const updateData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (allowedFields.includes(key)) {
      updateData[key] = value;
    }
  }

  return await paymentModel.update(id, updateData);
};

const remove = async (id) => {
  const payment = await paymentModel.findById(id);
  if (!payment) {
    throw new NotFoundError('Payment not found');
  }
  return await paymentModel.softDelete(id);
};

const getPendingDues = async () => {
  return await paymentModel.getPendingDues();
};

const getRevenueStats = async (fromDate, toDate) => {
  return await paymentModel.getRevenueStats(fromDate, toDate);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getPendingDues,
  getRevenueStats
};
