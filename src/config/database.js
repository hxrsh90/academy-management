const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
  // Vercel + Neon DB production config (serverless optimized)
  // Neon provides pooled connection via DATABASE_URL automatically
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Serverless optimized settings
    max: 1, // Vercel serverless functions work best with single connections
    idleTimeoutMillis: 0, // Close immediately after use in serverless
    connectionTimeoutMillis: 10000, // 10s timeout for cold starts
    allowExitOnIdle: true, // Important: allows function to exit
  };
} else if (process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL) {
  // Alternative Vercel Postgres env vars
  poolConfig = {
    connectionString: process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  };
} else {
  // Local development
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'academy_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Only log in development (avoid noise in production logs)
if (process.env.NODE_ENV !== 'production') {
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
  });
}

// Don't exit on error in production (let Vercel handle it)
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

module.exports = { pool };
