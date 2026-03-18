// Script to create admin user
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function createAdmin() {
  let connection;
  try {
    console.log('🔌 Connecting to database...');
    
    // ✅ استخدام MYSQL_URL مباشرة
    if (!process.env.MYSQL_URL) {
      throw new Error('MYSQL_URL is not defined in .env file');
    }
    
    connection = await mysql.createConnection(process.env.MYSQL_URL);
    console.log('✅ Connected to database');

    // Check if admin exists
    console.log('🔍 Checking if admin user exists...');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@maktabaty.com']
    );

    if (users.length > 0) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email:', users[0].email);
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
    console.log('   👤 Role: admin');
    console.log('   🆔 User ID:', result.insertId);
    
  } catch (error) {
    console.error('❌ Error creating admin:');
    console.error('   - Name:', error.name);
    console.error('   - Code:', error.code);
    console.error('   - Message:', error.message);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n💡 Hint: Table `users` does not exist. Run database initialization first.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Hint: Access denied. Check your MYSQL_URL credentials.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Hint: Host not found. Check your MYSQL_URL.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

createAdmin();