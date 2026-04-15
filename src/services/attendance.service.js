const attendanceModel = require('../models/attendance.model');
const classModel = require('../models/class.model');
const studentModel = require('../models/student.model');
const { NotFoundError } = require('../middleware/error.middleware');

const findAll = async (filters, page, limit) => {
  return await attendanceModel.findAll(filters, page, limit);
};

const findById = async (id) => {
  const attendance = await attendanceModel.findById(id);
  if (!attendance) {
    throw new NotFoundError('Attendance record not found');
  }
  return attendance;
};

const create = async (data) => {
  const classData = await classModel.findById(data.classId);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  const student = await studentModel.findById(data.studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  const fieldMapping = {
    classId: 'class_id',
    studentId: 'student_id',
    date: 'date',
    status: 'status',
    markedBy: 'marked_by',
    notes: 'notes'
  };

  const createData = {};
  for (const [key, value] of Object.entries(data)) {
    if (fieldMapping[key]) {
      createData[fieldMapping[key]] = value;
    }
  }

  return await attendanceModel.create(createData);
};

const bulkCreate = async (classId, date, records, markedBy) => {
  const classData = await classModel.findById(classId);
  if (!classData) {
    throw new NotFoundError('Class not found');
  }

  const results = [];
  for (const record of records) {
    const attendance = await attendanceModel.create({
      class_id: classId,
      student_id: record.studentId,
      date: date,
      status: record.status,
      marked_by: markedBy,
      notes: record.notes
    });
    results.push(attendance);
  }
  return results;
};

const update = async (id, data) => {
  const attendance = await attendanceModel.findById(id);
  if (!attendance) {
    throw new NotFoundError('Attendance record not found');
  }

  const updateData = {};
  if (data.status) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  return await attendanceModel.update(id, updateData);
};

const remove = async (id) => {
  const attendance = await attendanceModel.findById(id);
  if (!attendance) {
    throw new NotFoundError('Attendance record not found');
  }
  return await attendanceModel.delete(id);
};

const getClassAttendance = async (classId, date) => {
  return await attendanceModel.findByClassAndDate(classId, date);
};

const getStudentStats = async (studentId, fromDate, toDate) => {
  const stats = await attendanceModel.getStats(studentId, fromDate, toDate);
  const total = stats.reduce((sum, stat) => sum + parseInt(stat.count), 0);
  const present = stats.find(s => s.status === 'present')?.count || 0;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  
  return {
    total,
    present,
    absent: stats.find(s => s.status === 'absent')?.count || 0,
    late: stats.find(s => s.status === 'late')?.count || 0,
    excused: stats.find(s => s.status === 'excused')?.count || 0,
    percentage
  };
};

module.exports = {
  findAll,
  findById,
  create,
  bulkCreate,
  update,
  remove,
  getClassAttendance,
  getStudentStats
};
