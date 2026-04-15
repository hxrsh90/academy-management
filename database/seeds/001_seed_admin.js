const bcrypt = require('bcryptjs');
const { pool } = require('../../src/config/database');

const seedData = async () => {
  try {
    console.log('Seeding initial data...');

    // Create super admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(
      `INSERT INTO users (email, mobile, password_hash, role, status, email_verified_at, mobile_verified_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (mobile) DO NOTHING
       RETURNING id`,
      ['admin@academy.com', '9999999999', adminPassword, 'super_admin', 'active']
    );

    if (adminResult.rows.length > 0) {
      console.log('✓ Super admin created (mobile: 9999999999, password: admin123)');
    }

    // Create sample coach
    const coachPassword = await bcrypt.hash('coach123', 10);
    const coachResult = await pool.query(
      `INSERT INTO users (email, mobile, password_hash, role, status, email_verified_at, mobile_verified_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (mobile) DO NOTHING
       RETURNING id`,
      ['coach@academy.com', '8888888888', coachPassword, 'coach', 'active']
    );

    if (coachResult.rows.length > 0) {
      const coachId = coachResult.rows[0].id;
      await pool.query(
        `INSERT INTO students (user_id, first_name, last_name, skill_level, enrollment_status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [coachId, 'John', 'Coach', 'advanced', 'active']
      );
      console.log('✓ Sample coach created (mobile: 8888888888, password: coach123)');
    }

    // Create fee structure
    await pool.query(
      `INSERT INTO fee_structures (name, description, amount, frequency, applicable_to, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      ['Monthly Membership', 'Standard monthly fee for all students', 1500.00, 'monthly', 'all', true]
    );
    console.log('✓ Fee structure created');

    console.log('\nSeed completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedData();
