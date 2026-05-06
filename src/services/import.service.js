const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');
const { NotFoundError } = require('../middleware/error.middleware');

const SALT_ROUNDS = 10;

const generateBatchId = () => {
  return `IMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

const generateMobileFromName = (name, index) => {
  // Generate a unique mobile number based on name + index if not provided
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const prefix = cleanName.substring(0, 3).padEnd(3, '0');
  const asciiSum = prefix.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const suffix = String(asciiSum % 10000).padStart(4, '0');
  return `99${String(index + 1).padStart(3, '0')}${suffix}`;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Handle DD/MM/YY format (like 01/04/26)
  const ddmmyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (ddmmyyMatch) {
    const [, day, month, year] = ddmmyyMatch;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    return `${fullYear}-${month}-${day}`;
  }
  
  // Handle DD/MM/YYYY format
  const ddmmyyyyMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    return `${year}-${month}-${day}`;
  }
  
  // Handle dates with day names like "Friday, 1 May 2026"
  if (dateStr.includes('May') || dateStr.includes('Jan') || dateStr.includes('Feb') || 
      dateStr.includes('Mar') || dateStr.includes('Apr') || dateStr.includes('Jun') ||
      dateStr.includes('Jul') || dateStr.includes('Aug') || dateStr.includes('Sep') ||
      dateStr.includes('Oct') || dateStr.includes('Nov') || dateStr.includes('Dec')) {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Fall through
    }
  }
  
  return null;
};

const parseAmount = (amountStr) => {
  if (!amountStr) return 0;
  // Remove currency symbols, commas, whitespace
  const cleaned = String(amountStr).replace(/[₹,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const bulkImportStudents = async (students, defaultPassword, importedBy) => {
  const batchId = generateBatchId();
  const passwordHash = await bcrypt.hash(defaultPassword, SALT_ROUNDS);
  
  const results = {
    batchId,
    total: students.length,
    successful: 0,
    failed: 0,
    errors: [],
    created: []
  };

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create import log entry
    await client.query(
      `INSERT INTO import_logs (import_batch_id, file_name, total_rows, imported_by)
       VALUES ($1, $2, $3, $4)`,
      [batchId, 'bulk-import', students.length, importedBy]
    );

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      
      try {
        // Extract data from spreadsheet row
        const name = row.name || row.Name || '';
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const mobile = row.mobile || row.Mobile || row['Mobile Number'] || 
                      generateMobileFromName(name, i);
        
        const spoc = row.spoc || row.SPOC || row.Spoc || '';
        const plan = row.plan || row.Plan || '';
        const sport = row.sport || row.Sports || row.sports || '';
        
        const dateOfJoining = parseDate(row.dateOfJoining || row['Date of Joining'] || row.date_of_joining);
        const dateOfPayment = parseDate(row.dateOfPayment || row['Date of Payment'] || row.date_of_payment);
        const lastMembershipDate = parseDate(row.lastMembershipDate || row['Last Day of Membership'] || row.last_membership_date);
        const pendingPaidOn = parseDate(row.pendingPaidOn || row['Pending Amt to be paid on'] || row.pending_paid_on);
        
        const additionalDays = parseInt(row.additionalDays || row['Additional Days'] || row.additional_days) || 0;
        
        const registrationFees = parseAmount(row.registrationFees || row['Registration Fees'] || row.registration_fees);
        const discountRegistration = parseAmount(row.discountRegistration || row['Discount on Registration'] || row.discount_registration);
        const membershipAmount = parseAmount(row.membershipAmount || row['Membership Amount'] || row.membership_amount);
        const discountMembership = parseAmount(row.discountMembership || row['Discount on Membership'] || row.discount_membership);
        const siblingDiscount = parseAmount(row.siblingDiscount || row['Sibling/Referral Discount'] || row.sibling_discount);
        const totalAmount = parseAmount(row.totalAmount || row.Total || row.total || row['Total ']);
        const membershipPaid = parseAmount(row.membershipPaid || row['Membership Paid'] || row.membership_paid);
        const pendingAmount = parseAmount(row.pendingAmount || row.Pending || row.pending);
        
        const remarks = row.remarks || row.Remarks || '';

        // Check if user already exists by mobile
        const existingUserResult = await client.query(
          'SELECT id FROM users WHERE mobile = $1 AND deleted_at IS NULL',
          [mobile]
        );

        let userId;
        
        if (existingUserResult.rows.length > 0) {
          // User exists, update if needed
          userId = existingUserResult.rows[0].id;
          logger.info('Existing user found for import', { mobile, userId });
        } else {
          // Create new user with mobile + password
          const userResult = await client.query(
            `INSERT INTO users (email, mobile, password_hash, role, status)
             VALUES ($1, $2, $3, 'student', 'active')
             RETURNING id`,
            [null, mobile, passwordHash]
          );
          userId = userResult.rows[0].id;
        }

        // Check if student already exists
        const existingStudentResult = await client.query(
          'SELECT id FROM students WHERE user_id = $1 AND deleted_at IS NULL',
          [userId]
        );

        if (existingStudentResult.rows.length > 0) {
          // Update existing student with new membership data
          const studentId = existingStudentResult.rows[0].id;
          await client.query(
            `UPDATE students SET
              spoc = COALESCE($1, spoc),
              sport = COALESCE($2, sport),
              plan = COALESCE($3, plan),
              enrollment_date = COALESCE($4, enrollment_date),
              date_of_payment = COALESCE($5, date_of_payment),
              additional_days = $6,
              last_membership_date = COALESCE($7, last_membership_date),
              registration_fees = $8,
              discount_registration = $9,
              membership_amount = $10,
              discount_membership = $11,
              sibling_discount = $12,
              total_amount = $13,
              membership_paid = $14,
              pending_amount = $15,
              pending_paid_on = COALESCE($16, pending_paid_on),
              remarks = COALESCE($17, remarks),
              import_batch_id = $18,
              updated_at = CURRENT_TIMESTAMP
             WHERE id = $19`,
            [spoc, sport, plan, dateOfJoining, dateOfPayment, additionalDays,
             lastMembershipDate, registrationFees, discountRegistration,
             membershipAmount, discountMembership, siblingDiscount,
             totalAmount, membershipPaid, pendingAmount, pendingPaidOn,
             remarks, batchId, studentId]
          );
          
          results.created.push({
            index: i,
            name,
            mobile,
            userId,
            studentId,
            status: 'updated'
          });
        } else {
          // Create new student
          const studentResult = await client.query(
            `INSERT INTO students (
              user_id, first_name, last_name, enrollment_date,
              spoc, sport, plan, date_of_payment, additional_days, last_membership_date,
              registration_fees, discount_registration, membership_amount, discount_membership,
              sibling_discount, total_amount, membership_paid, pending_amount, pending_paid_on,
              remarks, import_batch_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
            RETURNING id`,
            [userId, firstName, lastName, dateOfJoining,
             spoc, sport, plan, dateOfPayment, additionalDays, lastMembershipDate,
             registrationFees, discountRegistration, membershipAmount, discountMembership,
             siblingDiscount, totalAmount, membershipPaid, pendingAmount, pendingPaidOn,
             remarks, batchId]
          );
          
          results.created.push({
            index: i,
            name,
            mobile,
            userId,
            studentId: studentResult.rows[0].id,
            status: 'created'
          });
        }

        results.successful++;
        
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          name: row.name || row.Name || 'Unknown',
          error: error.message
        });
        logger.error('Failed to import student row', { 
          index: i, 
          name: row.name || row.Name,
          error: error.message 
        });
      }
    }

    // Update import log with results
    await client.query(
      `UPDATE import_logs 
       SET successful_rows = $1, failed_rows = $2, error_log = $3
       WHERE import_batch_id = $4`,
      [results.successful, results.failed, 
       JSON.stringify(results.errors.slice(0, 50)), batchId]
    );

    await client.query('COMMIT');
    
    logger.info('Bulk import transaction committed', {
      batchId,
      successful: results.successful,
      failed: results.failed
    });

  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Bulk import transaction rolled back', { 
      batchId, 
      error: error.message 
    });
    throw error;
  } finally {
    client.release();
  }

  return results;
};

const getImportHistory = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const countResult = await pool.query('SELECT COUNT(*) FROM import_logs');
  const total = parseInt(countResult.rows[0].count);
  
  const result = await pool.query(
    `SELECT id, import_batch_id, file_name, total_rows, successful_rows, failed_rows,
            created_at, imported_by
     FROM import_logs
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return {
    imports: result.rows,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getImportDetails = async (batchId) => {
  const importResult = await pool.query(
    `SELECT * FROM import_logs WHERE import_batch_id = $1`,
    [batchId]
  );
  
  if (importResult.rows.length === 0) {
    throw new NotFoundError('Import batch not found');
  }
  
  const studentsResult = await pool.query(
    `SELECT s.id, s.first_name, s.last_name, s.spoc, s.sport, s.plan,
            s.enrollment_date, s.total_amount, s.membership_paid, s.pending_amount,
            s.remarks, u.mobile, s.import_batch_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.import_batch_id = $1 AND s.deleted_at IS NULL`,
    [batchId]
  );
  
  return {
    import: importResult.rows[0],
    students: studentsResult.rows
  };
};

module.exports = {
  bulkImportStudents,
  getImportHistory,
  getImportDetails
};
