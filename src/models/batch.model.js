const { pool } = require('../config/database');

const findAll = async (filters = {}) => {
  const { search, sportType, status, coachId, page = 1, limit = 10 } = filters;
  let query = `
    SELECT b.*,
           COALESCE(cs.first_name || ' ' || cs.last_name, cu.email, cu.mobile) as coach_name,
           cu.mobile as coach_mobile,
           COUNT(bs.id) as enrolled_count
    FROM batches b
    LEFT JOIN users cu ON b.coach_id = cu.id
    LEFT JOIN students cs ON cu.id = cs.user_id
    LEFT JOIN batch_students bs ON b.id = bs.batch_id AND bs.status = 'active'
    WHERE b.deleted_at IS NULL
  `;
  const params = [];
  let paramIndex = 1;

  if (search) {
    query += ` AND (b.name ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (sportType) {
    query += ` AND b.sport_type = $${paramIndex}`;
    params.push(sportType);
    paramIndex++;
  }
  if (status) {
    query += ` AND b.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  if (coachId) {
    query += ` AND b.coach_id = $${paramIndex}`;
    params.push(coachId);
    paramIndex++;
  }

  query += ` GROUP BY b.id, cs.first_name, cs.last_name, cu.email, cu.mobile ORDER BY b.created_at DESC`;

  // Pagination
  const offset = (page - 1) * limit;
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT b.*,
            COALESCE(cs.first_name || ' ' || cs.last_name, cu.email, cu.mobile) as coach_name,
            cu.mobile as coach_mobile
     FROM batches b
     LEFT JOIN users cu ON b.coach_id = cu.id
     LEFT JOIN students cs ON cu.id = cs.user_id
     WHERE b.id = $1 AND b.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0];
};

const create = async (batchData) => {
  const { name, description, sportType, skillLevel, coachId, capacity, startDate, endDate } = batchData;
  const result = await pool.query(
    `INSERT INTO batches (name, description, sport_type, skill_level, coach_id, capacity, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, description, sportType || 'general', skillLevel || 'beginner', coachId || null, capacity || 30, startDate, endDate]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['name', 'description', 'sport_type', 'skill_level', 'coach_id', 'capacity', 'status', 'start_date', 'end_date'];
  const updates = [];
  const values = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (allowedFields.includes(dbField) && value !== undefined) {
      updates.push(`${dbField} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  const result = await pool.query(
    `UPDATE batches SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
    values
  );
  return result.rows[0];
};

const remove = async (id) => {
  const result = await pool.query(
    `UPDATE batches SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// Batch students management
const getStudents = async (batchId) => {
  const result = await pool.query(
    `SELECT s.*, bs.enrollment_date, bs.status as batch_status
     FROM students s
     JOIN batch_students bs ON s.id = bs.student_id
     WHERE bs.batch_id = $1 AND bs.status = 'active' AND s.deleted_at IS NULL
     ORDER BY s.first_name`,
    [batchId]
  );
  return result.rows;
};

const addStudent = async (batchId, studentId) => {
  // Check if batch has capacity
  const batchResult = await pool.query(
    'SELECT capacity, current_enrolled FROM batches WHERE id = $1 AND deleted_at IS NULL',
    [batchId]
  );
  if (!batchResult.rows[0]) throw new Error('Batch not found');
  const batch = batchResult.rows[0];
  if (batch.current_enrolled >= batch.capacity) {
    throw new Error('Batch is at full capacity');
  }

  // Add student
  await pool.query(
    `INSERT INTO batch_students (batch_id, student_id) VALUES ($1, $2)
     ON CONFLICT (batch_id, student_id) DO UPDATE SET status = 'active', updated_at = CURRENT_TIMESTAMP`,
    [batchId, studentId]
  );

  // Update count
  await pool.query(
    'UPDATE batches SET current_enrolled = current_enrolled + 1 WHERE id = $1',
    [batchId]
  );

  return { success: true };
};

const removeStudent = async (batchId, studentId) => {
  await pool.query(
    `UPDATE batch_students SET status = 'inactive' WHERE batch_id = $1 AND student_id = $2`,
    [batchId, studentId]
  );
  await pool.query(
    'UPDATE batches SET current_enrolled = GREATEST(current_enrolled - 1, 0) WHERE id = $1',
    [batchId]
  );
  return { success: true };
};

// Get classes for batch
const getClasses = async (batchId) => {
  const result = await pool.query(
    `SELECT c.* FROM classes c
     WHERE c.batch_id = $1 AND c.deleted_at IS NULL AND c.is_active = true
     ORDER BY c.day_of_week, c.start_time`,
    [batchId]
  );
  return result.rows;
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
