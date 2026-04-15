const classModel = require('../models/class.model');
const { NotFoundError, ConflictError } = require('../middleware/error.middleware');

const findAll = async (filters, page, limit) => {
  return await classModel.findAll(filters, page, limit);
};

const findById = async (id) => {
  const classData = await classModel.findById(id);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }
  return classData;
};

const create = async (data) => {
  const fieldMapping = {
    name: 'name',
    description: 'description',
    sportType: 'sport_type',
    skillLevel: 'skill_level',
    dayOfWeek: 'day_of_week',
    startTime: 'start_time',
    endTime: 'end_time',
    durationMinutes: 'duration_minutes',
    coachId: 'coach_id',
    venue: 'venue',
    capacity: 'capacity'
  };

  const createData = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldMapping[key]) {
      createData[fieldMapping[key]] = value;
    }
  }

  return await classModel.create(createData);
};

const update = async (id, data) => {
  const classData = await classModel.findById(id);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  const fieldMapping = {
    name: 'name',
    description: 'description',
    sportType: 'sport_type',
    skillLevel: 'skill_level',
    dayOfWeek: 'day_of_week',
    startTime: 'start_time',
    endTime: 'end_time',
    durationMinutes: 'duration_minutes',
    coachId: 'coach_id',
    venue: 'venue',
    capacity: 'capacity',
    isActive: 'is_active'
  };

  const updateData = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldMapping[key]) {
      updateData[fieldMapping[key]] = value;
    }
  }

  return await classModel.update(id, updateData);
};

const remove = async (id) => {
  const classData = await classModel.findById(id);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }
  return await classModel.softDelete(id);
};

const getStudents = async (id) => {
  const classData = await classModel.findById(id);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }
  return await classModel.getStudents(id);
};

const addStudent = async (classId, studentId) => {
  const classData = await classModel.findById(classId);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }
  
  if (classData.current_enrolled >= classData.capacity) {
    throw new ConflictError('Class is at full capacity');
  }
  
  return await classModel.addStudent(classId, studentId);
};

const removeStudent = async (classId, studentId) => {
  const classData = await classModel.findById(classId);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }
  return await classModel.removeStudent(classId, studentId);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getStudents,
  addStudent,
  removeStudent
};
