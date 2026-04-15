const attendanceService = require('../services/attendance.service');
const { ValidationError } = require('../middleware/error.middleware');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, date, class_id, student_id, from_date, to_date } = req.query;
    const filters = { date, classId: class_id, studentId: student_id, fromDate: from_date, toDate: to_date };
    const attendance = await attendanceService.findAll(filters, parseInt(page), parseInt(limit));
    res.json({
      success: true,
      data: attendance,
      message: 'Attendance records retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await attendanceService.findById(parseInt(id));
    res.json({
      success: true,
      data: attendance,
      message: 'Attendance record retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { classId, studentId, date, status, notes } = req.body;
    const markedBy = req.user.id;
    const attendance = await attendanceService.create({ classId, studentId, date, status, markedBy, notes });
    res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    next(error);
  }
};

const bulkCreate = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;
    const markedBy = req.user.id;
    
    if (!Array.isArray(records) || records.length === 0) {
      throw new ValidationError('Records array is required');
    }
    
    const attendance = await attendanceService.bulkCreate(classId, date, records, markedBy);
    res.status(201).json({
      success: true,
      data: attendance,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const attendance = await attendanceService.update(parseInt(id), { status, notes });
    res.json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await attendanceService.remove(parseInt(id));
    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getClassAttendance = async (req, res, next) => {
  try {
    const { class_id, date } = req.query;
    if (!class_id || !date) {
      throw new ValidationError('Class ID and date are required');
    }
    const attendance = await attendanceService.getClassAttendance(parseInt(class_id), date);
    res.json({
      success: true,
      data: attendance,
      message: 'Class attendance retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getStudentStats = async (req, res, next) => {
  try {
    const { student_id, from_date, to_date } = req.query;
    if (!student_id || !from_date || !to_date) {
      throw new ValidationError('Student ID, from date, and to date are required');
    }
    const stats = await attendanceService.getStudentStats(parseInt(student_id), from_date, to_date);
    res.json({
      success: true,
      data: stats,
      message: 'Attendance stats retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  list,
  getById,
  create,
  bulkCreate,
  update,
  remove,
  getClassAttendance,
  getStudentStats
};
