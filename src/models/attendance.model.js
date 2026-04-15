const { pool } = require('../config/database');

const findAll = async (filters = {}, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filters.date) {
    whereClause += ` AND a.date = $${paramIndex++}`;
    params.push(filters.date);
  }
  if (filters.classId) {
    whereClause += ` AND a.class_id = $${paramIndex++}`;
    params.push(filters.classId);
  }
  if (filters.studentId) {
    whereClause += ` AND a.student_id = $${paramIndex++}`;
    params.push(filters.studentId);
  }
  if (filters.fromDate) {
    whereClause += ` AND a.date >= $${paramIndex++}`;
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    whereClause += ` AND a.date <= $${paramIndex++}`;
    params.push(filters.toDate);
  }

  const query = `
    SELECT a.*, c.name as class_name, s.first_name as student_first_name, s.last_name as student_last_name
    FROM attendance a
    JOIN classes c ON a.class_id = c.id
    JOIN students s ON a.student_id = s.id
    ${whereClause}
    ORDER BY a.date DESC, c.start_time ASC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, c.name as class_name, s.first_name as student_first_name, s.last_name as student_last_name
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     JOIN students s ON a.student_id = s.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const findByClassAndDate = async (classId, date) => {
  const result = await pool.query(
    `SELECT a.*, s.first_name as student_first_name, s.last_name as student_last_name
     FROM attendance a
     JOIN students s ON a.student_id = s.id
     WHERE a.class_id = $1 AND a.date = $2`,
    [classId, date]
  );
  return result.rows;
};

const create = async (attendanceData) => {
  const { classId, studentId, date, status, markedBy, notes } = attendanceData;

  const result = await pool.query(
    `INSERT INTO attendance (class_id, student_id, date, status, marked_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (class_id, student_id, date) DO UPDATE SET status = $4, marked_by = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [classId, studentId, date, status, markedBy, notes]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['status', 'notes'];
  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  const query = `UPDATE attendance SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const deleteRecord = async (id) => {
  const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING id', [id]);
  return result.rows[0] || null;
};

const getStats = async (studentId, fromDate, toDate) => {
  const result = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM attendance
     WHERE student_id = $1 AND date >= $2 AND date <= $3
     GROUP BY status`,
    [studentId, fromDate, toDate]
  );
  return result.rows;
};

module.exports = {
  findAll,
  findById,
  findByClassAndDate,
  create,
  update,
  delete: deleteRecord,
  getStats
};
