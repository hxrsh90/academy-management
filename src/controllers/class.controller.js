const classService = require('../services/class.service');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, is_active, coach_id, sport_type, skill_level } = req.query;
    const filters = { is_active: is_active === 'true', coach_id, sport_type, skill_level };
    const result = await classService.findAll(filters, parseInt(page), parseInt(limit));
    res.json({
      success: true,
      data: result.classes,
      meta: { page: result.page, limit, total: result.total, totalPages: result.totalPages },
      message: 'Classes retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = await classService.findById(parseInt(id));
    res.json({
      success: true,
      data: classData,
      message: 'Class retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const classData = await classService.create(req.body);
    res.status(201).json({
      success: true,
      data: classData,
      message: 'Class created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = await classService.update(parseInt(id), req.body);
    res.json({
      success: true,
      data: classData,
      message: 'Class updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await classService.remove(parseInt(id));
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const students = await classService.getStudents(parseInt(id));
    res.json({
      success: true,
      data: students,
      message: 'Class students retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

const addStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { student_id } = req.body;
    const result = await classService.addStudent(parseInt(id), student_id);
    res.json({
      success: true,
      data: result,
      message: 'Student added to class successfully'
    });
  } catch (error) {
    next(error);
  }
};

const removeStudent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    await classService.removeStudent(parseInt(id), parseInt(studentId));
    res.json({
      success: true,
      message: 'Student removed from class successfully'
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
  getStudents,
  addStudent,
  removeStudent
};
