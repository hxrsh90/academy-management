const studentModel = require('../models/student.model');
const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { NotFoundError, ConflictError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

const findAll = async (filters, page, limit) => {
  return await studentModel.findAll(filters, page, limit);
};

const findById = async (id) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  return student;
};

const create = async (data) => {
  const { email, mobile, password, firstName, lastName, ...studentData } = data;

  const existingUser = await userModel.findByMobile(mobile);
  if (existingUser) {
    throw new ConflictError('Mobile number already registered');
  }

  const passwordHash = await bcrypt.hash(password || 'TempPass123!', SALT_ROUNDS);

  const user = await userModel.create({
    email,
    mobile,
    passwordHash,
    role: 'student'
  });

  const student = await studentModel.create({
    userId: user.id,
    firstName,
    lastName,
    ...studentData
  });

  return { ...student, email: user.email, mobile: user.mobile };
};

const update = async (id, data) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const updateData = {};
  const fieldMapping = {
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',
    gender: 'gender',
    parentId: 'parent_id',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    medicalInfo: 'medical_info',
    bloodGroup: 'blood_group',
    photoUrl: 'photo_url',
    skillLevel: 'skill_level',
    enrollmentStatus: 'enrollment_status'
  };

  for (const [key, value] of Object.entries(data)) {
    if (fieldMapping[key]) {
      updateData[fieldMapping[key]] = value;
    }
  }

  return await studentModel.update(id, updateData);
};

const remove = async (id) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  await studentModel.softDelete(id);
  await userModel.softDelete(student.user_id);
  return { id };
};

const getClasses = async (id) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  return await studentModel.getClasses(id);
};

const getAttendance = async (id, filters) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  return await studentModel.getAttendance(id, filters);
};

const getPayments = async (id, filters) => {
  const student = await studentModel.findById(id);
  if (!student) {
    throw new NotFoundError('Student not found');
  }
  return await studentModel.getPayments(id, filters);
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getClasses,
  getAttendance,
  getPayments
};
