const { pool } = require('../config/database');

const findAll = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE p.deleted_at IS NULL';
  const params = [];
  let paramIndex = 1;

  if (filters.studentId) {
    whereClause += ` AND p.student_id = $${paramIndex++}`;
    params.push(filters.studentId);
  }
  if (filters.status) {
    whereClause += ` AND p.status = $${paramIndex++}`;
    params.push(filters.status);
  }
  if (filters.feeType) {
    whereClause += ` AND p.fee_type = $${paramIndex++}`;
    params.push(filters.feeType);
  }
  if (filters.fromDate) {
    whereClause += ` AND p.payment_date >= $${paramIndex++}`;
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    whereClause += ` AND p.payment_date <= $${paramIndex++}`;
    params.push(filters.toDate);
  }

  const countQuery = `SELECT COUNT(*) FROM payments p ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT p.*, s.first_name as student_first_name, s.last_name as student_last_name, u.mobile as student_mobile
    FROM payments p
    JOIN students s ON p.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ${whereClause}
    ORDER BY p.payment_date DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { payments: result.rows, total, page, totalPages: Math.ceil(total / limit) };
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, s.first_name as student_first_name, s.last_name as student_last_name
     FROM payments p
     JOIN students s ON p.student_id = s.id
     WHERE p.id = $1 AND p.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
};

const create = async (paymentData) => {
  // Accept both snake_case (from service after mapping) and camelCase (direct use)
  const studentId = paymentData.student_id ?? paymentData.studentId;
  const amount = paymentData.amount;
  const paymentDate = paymentData.payment_date ?? paymentData.paymentDate;
  const paymentMode = paymentData.payment_mode ?? paymentData.paymentMode;
  const invoiceNumber = paymentData.invoice_number ?? paymentData.invoiceNumber;
  const feeType = paymentData.fee_type ?? paymentData.feeType;
  const receiptUrl = paymentData.receipt_url ?? paymentData.receiptUrl;
  const recordedBy = paymentData.recorded_by ?? paymentData.recordedBy;
  const notes = paymentData.notes;

  const result = await pool.query(
    `INSERT INTO payments (student_id, amount, payment_date, payment_mode, invoice_number, fee_type, receipt_url, recorded_by, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [studentId, amount, paymentDate, paymentMode, invoiceNumber, feeType, receiptUrl, recordedBy, notes]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['amount', 'payment_date', 'payment_mode', 'fee_type', 'status', 'receipt_url', 'notes'];
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
  const query = `UPDATE payments SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const softDelete = async (id) => {
  const result = await pool.query(
    'UPDATE payments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

const getPendingDues = async () => {
  const result = await pool.query(
    `SELECT s.id as student_id, s.first_name, s.last_name, u.mobile,
            COALESCE(SUM(p.amount), 0) as total_paid,
            fs.amount as monthly_fee
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN payments p ON s.id = p.student_id AND p.status = 'paid' AND p.deleted_at IS NULL
     CROSS JOIN (SELECT amount FROM fee_structures WHERE frequency = 'monthly' AND is_active = true LIMIT 1) fs
     WHERE s.enrollment_status = 'active' AND s.deleted_at IS NULL
     GROUP BY s.id, s.first_name, s.last_name, u.mobile, fs.amount
     HAVING COALESCE(SUM(p.amount), 0) < fs.amount`
  );
  return result.rows;
};

const getRevenueStats = async (fromDate, toDate) => {
  const result = await pool.query(
    `SELECT fee_type, SUM(amount) as total, COUNT(*) as count
     FROM payments
     WHERE payment_date >= $1 AND payment_date <= $2 AND status = 'paid' AND deleted_at IS NULL
     GROUP BY fee_type`,
    [fromDate, toDate]
  );
  return result.rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
  getPendingDues,
  getRevenueStats
};
