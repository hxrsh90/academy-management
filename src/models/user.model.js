const { pool } = require('../config/database');

const findAll = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE u.deleted_at IS NULL';
  const params = [];
  let paramIndex = 1;

  if (filters.role) {
    whereClause += ` AND u.role = $${paramIndex++}`;
    params.push(filters.role);
  }
  if (filters.status) {
    whereClause += ` AND u.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters.search) {
    whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.mobile ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(*) FROM users u ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT u.id, u.email, u.mobile, u.role, u.status, u.created_at, u.updated_at
    FROM users u
    ${whereClause}
    ORDER BY u.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { users: result.rows, total, page, totalPages: Math.ceil(total / limit) };
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT id, email, mobile, role, status, email_verified_at, mobile_verified_at, created_at, updated_at
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
};

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );
  return result.rows[0] || null;
};

const findByMobile = async (mobile) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE mobile = $1 AND deleted_at IS NULL',
    [mobile]
  );
  return result.rows[0] || null;
};

const create = async (userData) => {
  const { email, mobile, passwordHash, role } = userData;
  const result = await pool.query(
    `INSERT INTO users (email, mobile, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, mobile, role, status, created_at`,
    [email, mobile, passwordHash, role]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['email', 'mobile', 'password_hash', 'status', 'email_verified_at', 'mobile_verified_at'];
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
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING id, email, mobile, role, status, updated_at`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const softDelete = async (id) => {
  const result = await pool.query(
    'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

module.exports = {
  findAll,
  findById,
  findByEmail,
  findByMobile,
  create,
  update,
  softDelete
};
