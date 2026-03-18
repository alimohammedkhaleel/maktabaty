const mysql = require('mysql2/promise');
require('dotenv').config();

// إنشاء pool للاتصالات
const pool = mysql.createPool(process.env.MYSQL_URL);

// اختبار الاتصال
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database pool connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database pool connection failed:', error.message);
    return false;
  }
};

// دالة مساعدة للاستعلامات
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};