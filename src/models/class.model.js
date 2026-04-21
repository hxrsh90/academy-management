const { pool } = require('../config/database');

const findAll = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE c.deleted_at IS NULL';
  const params = [];
  let paramIndex = 1;

  if (filters.is_active !== undefined) {
    whereClause += ` AND c.is_active = $${paramIndex++}`;
    params.push(filters.is_active);
  }
  if (filters.coach_id) {
    whereClause += ` AND c.coach_id = $${paramIndex++}`;
    params.push(filters.coach_id);
  }
  if (filters.sport_type) {
    whereClause += ` AND c.sport_type = $${paramIndex++}`;
    params.push(filters.sport_type);
  }
  if (filters.skill_level) {
    whereClause += ` AND c.skill_level = $${paramIndex++}`;
    params.push(filters.skill_level);
  }

  const countQuery = `SELECT COUNT(*) FROM classes c ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT c.*, s.first_name as coach_first_name, s.last_name as coach_last_name, u.mobile as coach_mobile
    FROM classes c
    LEFT JOIN users cu ON c.coach_id = cu.id
    LEFT JOIN students s ON cu.id = s.user_id
    LEFT JOIN users u ON cu.id = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { classes: result.rows, total, page, totalPages: Math.ceil(total / limit) };
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT c.*, s.first_name as coach_first_name, s.last_name as coach_last_name, u.mobile as coach_mobile
     FROM classes c
     LEFT JOIN users cu ON c.coach_id = cu.id
     LEFT JOIN students s ON cu.id = s.user_id
     LEFT JOIN users u ON cu.id = u.id
     WHERE c.id = $1 AND c.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (classData) => {
  const {
    name, description, sportType, skillLevel, dayOfWeek,
    startTime, endTime, durationMinutes, coachId, venue, capacity
  } = classData;

  const result = await pool.query(
    `INSERT INTO classes (name, description, sport_type, skill_level, day_of_week,
     start_time, end_time, duration_minutes, coach_id, venue, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [name, description, sportType || 'general', skillLevel || 'beginner', dayOfWeek || 'monday',
     startTime || '16:00', endTime || '17:00', durationMinutes || 60, coachId ? parseInt(coachId) : null, venue, capacity]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['name', 'description', 'sport_type', 'skill_level', 'day_of_week',
    'start_time', 'end_time', 'duration_minutes', 'coach_id', 'venue', 'capacity', 'is_active'];
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
  const query = `UPDATE classes SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const softDelete = async (id) => {
  const result = await pool.query(
    'UPDATE classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

const getStudents = async (classId) => {
  const result = await pool.query(
    `SELECT s.*, u.email, u.mobile, cs.enrollment_date
     FROM students s
     JOIN users u ON s.user_id = u.id
     JOIN class_students cs ON s.id = cs.student_id
     WHERE cs.class_id = $1 AND cs.status = 'active' AND s.deleted_at IS NULL`,
    [classId]
  );
  return result.rows;
};

const addStudent = async (classId, studentId) => {
  const result = await pool.query(
    `INSERT INTO class_students (class_id, student_id) VALUES ($1, $2)
     ON CONFLICT (class_id, student_id) DO UPDATE SET status = 'active'
     RETURNING *`,
    [classId, studentId]
  );
  
  await pool.query(
    'UPDATE classes SET current_enrolled = current_enrolled + 1 WHERE id = $1',
    [classId]
  );
  
  return result.rows[0];
};

const removeStudent = async (classId, studentId) => {
  const result = await pool.query(
    `UPDATE class_students SET status = 'inactive' 
     WHERE class_id = $1 AND student_id = $2 RETURNING *`,
    [classId, studentId]
  );
  
  if (result.rows.length > 0) {
    await pool.query(
      'UPDATE classes SET current_enrolled = GREATEST(current_enrolled - 1, 0) WHERE id = $1',
      [classId]
    );
  }
  
  return result.rows[0];
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  getStudents,
  addStudent,
  removeStudent
};
