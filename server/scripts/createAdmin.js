// Script to create admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  try {
    // Connect without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Check if admin exists
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@library.com']
    );

    if (users.length > 0) {
      console.log('⚠️ Admin user already exists');
      await connection.end();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@library.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@library.com');
    console.log('   Password: admin123');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
}

createAdmin();
