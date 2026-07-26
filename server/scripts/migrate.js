// ─────────────────────────────────────────────────────────────────
// Migrate: Run database initialization directly using initDB module
// Usage: node scripts/migrate.js
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();
const { Pool } = require('pg');
const initializeDatabase = require('../config/initDB');

async function runMigration() {
  console.log('🔄 Running migration on Neon PostgreSQL...');
  console.log(`📍 Database: Neon (${process.env.DATABASE_URL ? 'URL set ✓' : 'URL MISSING ✗'})`);

  try {
    await initializeDatabase();

    // Verify tables
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    const { rows: tables } = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    client.release();
    await pool.end();

    console.log('\n📋 Tables in database:');
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found! Migration may have failed silently.');
    } else {
      tables.forEach(t => console.log(`   ✓ ${t.tablename}`));
    }

    console.log('\n✅ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
