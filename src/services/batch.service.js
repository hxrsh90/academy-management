const batchModel = require('../models/batch.model');
const { NotFoundError, ConflictError } = require('../utils/errors');

const findAll = async (filters) => {
  return await batchModel.findAll(filters);
};

const findById = async (id) => {
  const batch = await batchModel.findById(id);
  if (!batch) throw new NotFoundError('Batch not found');
  return batch;
};

const create = async (batchData) => {
  // Validate dates if provided
  if (batchData.startDate && batchData.endDate) {
    if (new Date(batchData.startDate) > new Date(batchData.endDate)) {
      throw new Error('Start date must be before end date');
    }
  }
  return await batchModel.create(batchData);
};

const update = async (id, updateData) => {
  const batch = await batchModel.findById(id);
  if (!batch) throw new NotFoundError('Batch not found');

  // Validate dates if both provided
  const startDate = updateData.startDate || batch.start_date;
  const endDate = updateData.endDate || batch.end_date;
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new Error('Start date must be before end date');
  }

  return await batchModel.update(id, updateData);
};

const remove = async (id) => {
  const batch = await batchModel.findById(id);
  if (!batch) throw new NotFoundError('Batch not found');
  return await batchModel.remove(id);
};

// Student management
const getStudents = async (batchId) => {
  const batch = await batchModel.findById(batchId);
  if (!batch) throw new NotFoundError('Batch not found');
  return await batchModel.getStudents(batchId);
};

const addStudent = async (batchId, studentId) => {
  const batch = await batchModel.findById(batchId);
  if (!batch) throw new NotFoundError('Batch not found');
  
  try {
    return await batchModel.addStudent(batchId, studentId);
  } catch (err) {
    if (err.message === 'Batch is at full capacity') {
      throw new ConflictError('Batch is at full capacity');
    }
    throw err;
  }
};

const removeStudent = async (batchId, studentId) => {
  const batch = await batchModel.findById(batchId);
  if (!batch) throw new NotFoundError('Batch not found');
  return await batchModel.removeStudent(batchId, studentId);
};

// Get batch classes
const getClasses = async (batchId) => {
  const batch = await batchModel.findById(batchId);
  if (!batch) throw new NotFoundError('Batch not found');
  return await batchModel.getClasses(batchId);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getStudents,
  addStudent,
  removeStudent,
  getClasses
};
