const { pool } = require('../config/database');

const findAll = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let whereClause = 'WHERE s.deleted_at IS NULL';
  const params = [];
  let paramIndex = 1;

  if (filters.enrollment_status) {
    whereClause += ` AND s.enrollment_status = $${paramIndex++}`;
    params.push(filters.enrollment_status);
  }
  if (filters.skill_level) {
    whereClause += ` AND s.skill_level = $${paramIndex++}`;
    params.push(filters.skill_level);
  }
  if (filters.sport) {
    whereClause += ` AND s.sport = $${paramIndex++}`;
    params.push(filters.sport);
  }
  if (filters.spoc) {
    whereClause += ` AND s.spoc = $${paramIndex++}`;
    params.push(filters.spoc);
  }
  if (filters.plan) {
    whereClause += ` AND s.plan = $${paramIndex++}`;
    params.push(filters.plan);
  }
  if (filters.search) {
    whereClause += ` AND (s.first_name ILIKE $${paramIndex} OR s.last_name ILIKE $${paramIndex} OR u.mobile ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(*) FROM students s JOIN users u ON s.user_id = u.id ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  const query = `
    SELECT s.id, s.first_name, s.last_name, s.skill_level, s.enrollment_status, s.enrollment_date,
           s.spoc, s.sport, s.plan, s.date_of_payment, s.additional_days, s.last_membership_date,
           s.registration_fees, s.discount_registration, s.membership_amount, s.discount_membership,
           s.sibling_discount, s.total_amount, s.membership_paid, s.pending_amount, s.pending_paid_on,
           s.remarks, s.import_batch_id,
           u.mobile, u.email, u.status as user_status
    FROM students s
    JOIN users u ON s.user_id = u.id
    ${whereClause}
    ORDER BY s.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return { students: result.rows, total, page, totalPages: Math.ceil(total / limit) };
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT s.*, u.email, u.mobile, u.status as user_status
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] || null;
};

const findByMobile = async (mobile) => {
  const result = await pool.query(
    `SELECT s.*, u.email, u.mobile, u.status as user_status
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE u.mobile = $1 AND s.deleted_at IS NULL`,
    [mobile]
  );
  return result.rows[0] || null;
};

const findByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT s.*, u.email, u.mobile
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = $1 AND s.deleted_at IS NULL`,
    [userId]
  );
  return result.rows[0] || null;
};

const create = async (studentData) => {
  const {
    userId, firstName, lastName, dateOfBirth, gender, parentId,
    emergencyContactName, emergencyContactPhone, medicalInfo, bloodGroup,
    photoUrl, skillLevel,
    spoc, sport, plan, dateOfPayment, additionalDays, lastMembershipDate,
    registrationFees, discountRegistration, membershipAmount, discountMembership,
    siblingDiscount, totalAmount, membershipPaid, pendingAmount, pendingPaidOn,
    remarks, importBatchId
  } = studentData;

  const result = await pool.query(
    `INSERT INTO students (user_id, first_name, last_name, date_of_birth, gender, parent_id,
     emergency_contact_name, emergency_contact_phone, medical_info, blood_group, photo_url, skill_level,
     spoc, sport, plan, date_of_payment, additional_days, last_membership_date,
     registration_fees, discount_registration, membership_amount, discount_membership,
     sibling_discount, total_amount, membership_paid, pending_amount, pending_paid_on,
     remarks, import_batch_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
             $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
     RETURNING *`,
    [userId, firstName, lastName, dateOfBirth, gender, parentId,
     emergencyContactName, emergencyContactPhone, medicalInfo, bloodGroup, photoUrl, skillLevel || 'beginner',
     spoc, sport, plan, dateOfPayment, additionalDays || 0, lastMembershipDate,
     registrationFees || 0, discountRegistration || 0, membershipAmount || 0, discountMembership || 0,
     siblingDiscount || 0, totalAmount || 0, membershipPaid || 0, pendingAmount || 0, pendingPaidOn,
     remarks, importBatchId]
  );
  return result.rows[0];
};

const update = async (id, updateData) => {
  const allowedFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'parent_id',
    'emergency_contact_name', 'emergency_contact_phone', 'medical_info', 'blood_group',
    'photo_url', 'skill_level', 'enrollment_status',
    'spoc', 'sport', 'plan', 'date_of_payment', 'additional_days', 'last_membership_date',
    'registration_fees', 'discount_registration', 'membership_amount', 'discount_membership',
    'sibling_discount', 'total_amount', 'membership_paid', 'pending_amount', 'pending_paid_on',
    'remarks'];
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
  const query = `UPDATE students SET ${updates.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

const softDelete = async (id) => {
  const result = await pool.query(
    'UPDATE students SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
    [id]
  );
  return result.rows[0] || null;
};

const getClasses = async (studentId) => {
  const result = await pool.query(
    `SELECT c.*, cs.enrollment_date, cs.status as enrollment_status, 
            u.first_name as coach_first_name, u.last_name as coach_last_name
     FROM classes c
     JOIN class_students cs ON c.id = cs.class_id
     JOIN users cu ON c.coach_id = cu.id
     LEFT JOIN students u ON cu.id = u.user_id
     WHERE cs.student_id = $1 AND cs.status = 'active' AND c.deleted_at IS NULL`,
    [studentId]
  );
  return result.rows;
};

const getAttendance = async (studentId, filters = {}) => {
  let whereClause = 'WHERE a.student_id = $1';
  const params = [studentId];
  let paramIndex = 2;

  if (filters.fromDate) {
    whereClause += ` AND a.date >= $${paramIndex++}`;
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    whereClause += ` AND a.date <= $${paramIndex++}`;
    params.push(filters.toDate);
  }
  if (filters.classId) {
    whereClause += ` AND a.class_id = $${paramIndex++}`;
    params.push(filters.classId);
  }

  let query = `SELECT a.*, c.name as class_name, c.sport_type
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     ${whereClause}
     ORDER BY a.date DESC`;
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(filters.limit);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
};

const getPayments = async (studentId, filters = {}) => {
  const params = [studentId];
  let paramIndex = 2;
  
  let query = `SELECT p.*, u.email as recorded_by_email
     FROM payments p
     LEFT JOIN users u ON p.recorded_by = u.id
     WHERE p.student_id = $1 AND p.deleted_at IS NULL
     ORDER BY p.payment_date DESC`;
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(filters.limit);
  }
  
  const result = await pool.query(query, params);
  return result.rows;
};

module.exports = {
  findAll,
  findById,
  findByUserId,
  findByMobile,
  create,
  update,
  softDelete,
  getClasses,
  getAttendance,
  getPayments
};
