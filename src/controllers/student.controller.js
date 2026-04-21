const studentService = require('../services/student.service');
const { ValidationError } = require('../middleware/error.middleware');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, skill_level, search } = req.query;
    const filters = { enrollment_status: status, skill_level, search };
    const result = await studentService.findAll(filters, parseInt(page), parseInt(limit));
    res.json({
      success: true,
      data: result.students,
      meta: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      message: 'Students retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.findById(parseInt(id));
    res.json({
      success: true,
      data: student,
      message: 'Student retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const student = await studentService.create(req.body);
    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await studentService.update(parseInt(id), req.body);
    res.json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await studentService.remove(parseInt(id));
    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getClasses = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classes = await studentService.getClasses(parseInt(id));
    res.json({
      success: true,
      data: classes,
      message: 'Student classes retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { from_date, to_date, class_id, limit } = req.query;
    const attendance = await studentService.getAttendance(parseInt(id), { fromDate: from_date, toDate: to_date, classId: class_id, limit: parseInt(limit) || null });
    res.json({
      success: true,
      data: attendance,
      message: 'Student attendance retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getPayments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit } = req.query;
    const payments = await studentService.getPayments(parseInt(id), { limit: parseInt(limit) || null });
    res.json({
      success: true,
      data: payments,
      message: 'Student payments retrieved successfully'
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
  getClasses,
  getAttendance,
  getPayments
};
