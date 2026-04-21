const batchService = require('../services/batch.service');

const list = async (req, res, next) => {
  try {
    const { search, sportType, status, coachId, page, limit } = req.query;
    const batches = await batchService.findAll({ search, sportType, status, coachId, page, limit });
    res.json({ success: true, data: batches });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const batch = await batchService.findById(req.params.id);
    res.json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const batch = await batchService.create(req.body);
    res.status(201).json({ success: true, data: batch, message: 'Batch created successfully' });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const batch = await batchService.update(req.params.id, req.body);
    res.json({ success: true, data: batch, message: 'Batch updated successfully' });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await batchService.remove(req.params.id);
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Student management
const getStudents = async (req, res, next) => {
  try {
    const students = await batchService.getStudents(req.params.id);
    res.json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

const addStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    await batchService.addStudent(req.params.id, studentId);
    res.json({ success: true, message: 'Student added to batch' });
  } catch (error) {
    next(error);
  }
};

const removeStudent = async (req, res, next) => {
  try {
    await batchService.removeStudent(req.params.id, req.params.studentId);
    res.json({ success: true, message: 'Student removed from batch' });
  } catch (error) {
    next(error);
  }
};

// Get batch classes
const getClasses = async (req, res, next) => {
  try {
    const classes = await batchService.getClasses(req.params.id);
    res.json({ success: true, data: classes });
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
  removeStudent,
  getClasses
};
