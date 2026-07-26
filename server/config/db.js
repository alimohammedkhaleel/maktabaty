const { Pool } = require('pg');
require('dotenv').config();

// Neon PostgreSQL Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Serverless-optimized settings
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test connection on startup (dev only)
if (process.env.NODE_ENV !== 'production') {
  pool.connect()
    .then(client => {
      console.log('✅ Neon PostgreSQL Connected Successfully');
      client.release();
    })
    .catch(err => {
      console.error('❌ Neon PostgreSQL Connection Error:', err.message);
    });
}

module.exports = pool;
