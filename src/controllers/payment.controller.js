const paymentService = require('../services/payment.service');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, student_id, status, fee_type, from_date, to_date } = req.query;
    const filters = { 
      studentId: student_id, 
      status, 
      feeType: fee_type, 
      fromDate: from_date, 
      toDate: to_date 
    };
    const result = await paymentService.findAll(filters, parseInt(page), parseInt(limit));
    res.json({
      success: true,
      data: result.payments,
      meta: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      message: 'Payments retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.findById(parseInt(id));
    res.json({
      success: true,
      data: payment,
      message: 'Payment retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const recordedBy = req.user.id;
    const payment = await paymentService.create(req.body, recordedBy);
    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment recorded successfully'
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.update(parseInt(id), req.body);
    res.json({
      success: true,
      data: payment,
      message: 'Payment updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await paymentService.remove(parseInt(id));
    res.json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getPendingDues = async (req, res, next) => {
  try {
    const dues = await paymentService.getPendingDues();
    res.json({
      success: true,
      data: dues,
      message: 'Pending dues retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueStats = async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    const stats = await paymentService.getRevenueStats(from_date, to_date);
    res.json({
      success: true,
      data: stats,
      message: 'Revenue stats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getPendingDues,
  getRevenueStats
};
