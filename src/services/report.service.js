const { pool } = require('../config/database');

const getDashboardStats = async () => {
  const queries = {
    totalStudents: `SELECT COUNT(*) FROM students WHERE enrollment_status = 'active' AND deleted_at IS NULL`,
    totalClasses: `SELECT COUNT(*) FROM classes WHERE is_active = true AND deleted_at IS NULL`,
    totalCoaches: `SELECT COUNT(*) FROM users WHERE role = 'coach' AND status = 'active' AND deleted_at IS NULL`,
    todayAttendance: `SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE`,
    pendingPayments: `SELECT COUNT(DISTINCT student_id) FROM payments WHERE status = 'pending' AND deleted_at IS NULL`,
    monthlyRevenue: `SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE) AND status = 'paid' AND deleted_at IS NULL`
  };

  const results = await Promise.all(
    Object.entries(queries).map(async ([key, query]) => {
      const result = await pool.query(query);
      return [key, parseInt(result.rows[0].count) || parseInt(result.rows[0].coalesce) || 0];
    })
  );

  return Object.fromEntries(results);
};

const getAttendanceReport = async ({ fromDate, toDate, classId, studentId }) => {
  let whereClause = 'WHERE a.date >= $1 AND a.date <= $2';
  const params = [fromDate, toDate];
  let paramIndex = 3;

  if (classId) {
    whereClause += ` AND a.class_id = $${paramIndex++}`;
    params.push(classId);
  }
  if (studentId) {
    whereClause += ` AND a.student_id = $${paramIndex++}`;
    params.push(studentId);
  }

  const summary = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM attendance a
     ${whereClause}
     GROUP BY status`,
    params
  );

  const details = await pool.query(
    `SELECT a.date, c.name as class_name, s.first_name as student_first_name, s.last_name as student_last_name, a.status
     FROM attendance a
     JOIN classes c ON a.class_id = c.id
     JOIN students s ON a.student_id = s.id
     ${whereClause}
     ORDER BY a.date DESC`,
    params
  );

  return { summary: summary.rows, details: details.rows };
};

const getPaymentReport = async (fromDate, toDate) => {
  const summary = await pool.query(
    `SELECT fee_type, SUM(amount) as total, COUNT(*) as count
     FROM payments
     WHERE payment_date >= $1 AND payment_date <= $2 AND status = 'paid' AND deleted_at IS NULL
     GROUP BY fee_type`,
    [fromDate, toDate]
  );

  const details = await pool.query(
    `SELECT p.payment_date, p.amount, p.fee_type, p.payment_mode, 
            s.first_name as student_first_name, s.last_name as student_last_name
     FROM payments p
     JOIN students s ON p.student_id = s.id
     WHERE p.payment_date >= $1 AND p.payment_date <= $2 AND p.status = 'paid' AND p.deleted_at IS NULL
     ORDER BY p.payment_date DESC`,
    [fromDate, toDate]
  );

  return { summary: summary.rows, details: details.rows };
};

const getEnrollmentReport = async (fromDate, toDate) => {
  const monthly = await pool.query(
    `SELECT DATE_TRUNC('month', enrollment_date) as month, COUNT(*) as count
     FROM students
     WHERE enrollment_date >= $1 AND enrollment_date <= $2 AND deleted_at IS NULL
     GROUP BY DATE_TRUNC('month', enrollment_date)
     ORDER BY month`,
    [fromDate, toDate]
  );

  const bySport = await pool.query(
    `SELECT c.sport_type, COUNT(DISTINCT cs.student_id) as count
     FROM class_students cs
     JOIN classes c ON cs.class_id = c.id
     JOIN students s ON cs.student_id = s.id
     WHERE cs.enrollment_date >= $1 AND cs.enrollment_date <= $2 AND s.deleted_at IS NULL
     GROUP BY c.sport_type`,
    [fromDate, toDate]
  );

  return { monthly: monthly.rows, bySport: bySport.rows };
};

module.exports = {
  getDashboardStats,
  getAttendanceReport,
  getPaymentReport,
  getEnrollmentReport
};
