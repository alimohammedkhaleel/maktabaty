// Script to create admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function createAdmin() {
  let connection;
  try {
    console.log('🔌 Connecting to database...');
    console.log('📁 Using .env file from:', path.resolve(__dirname, '../.env'));
    
    // ✅ استخدام MYSQL_URL من ملف .env
    if (!process.env.MYSQL_URL) {
      console.error('❌ MYSQL_URL is not defined in .env file');
      console.log('📋 Available env vars:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
      return;
    }

    console.log('✅ MYSQL_URL found (first 20 chars):', process.env.MYSQL_URL.substring(0, 30) + '...');
    
    // الاتصال بقاعدة البيانات
    connection = await mysql.createConnection(process.env.MYSQL_URL);
    console.log('✅ Connected to database successfully');

    // التحقق من جدول users
    console.log('🔍 Checking if users table exists...');
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'"
    );

    if (tables.length === 0) {
      console.error('❌ Users table does not exist!');
      console.log('💡 Hint: Run database initialization first (initializeDatabase function)');
      return;
    }

    // Check if admin exists
    console.log('🔍 Checking if admin user exists...');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      ['admin@maktabaty.com', 'admin']
    );

    if (users.length > 0) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email:', users[0].email);
      console.log('👤 Username:', users[0].username);
      console.log('👤 Role:', users[0].role);
      await connection.end();
      return;
    }

    // Create admin user
    console.log('📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      ['admin', 'admin@maktabaty.com', hashedPassword, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('   📧 Email: admin@maktabaty.com');
    console.log('   🔑 Password: admin123');
    console.log('   👤 Username: admin');
    console.log('   👤 Role: admin');
    console.log('   🆔 User ID:', result.insertId);
    
  } catch (error) {
    console.error('❌ Error creating admin:');
    console.error('   - Name:', error.name);
    console.error('   - Code:', error.code);
    console.error('   - Message:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Hint: Access denied. Check your MYSQL_URL credentials:');
      console.error('   - Make sure the password is correct');
      console.error('   - Make sure the host and port are correct');
      console.error('   - Try using the Public Network URL from Railway');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n💡 Hint: Table `users` does not exist. Run database initialization first.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Hint: Host not found. Check your MYSQL_URL hostname.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Hint: Database does not exist. Check the database name in MYSQL_URL.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createAdmin();