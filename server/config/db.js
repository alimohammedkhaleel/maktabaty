const mysql = require('mysql2/promise');
require('dotenv').config();

// 🔍 تشخيص المشكلة
console.log('🔥 MYSQL_URL value:', process.env.MYSQL_URL ? 'EXISTS' : 'UNDEFINED');
console.log('🔥 MYSQL_URL raw:', JSON.stringify(process.env.MYSQL_URL));
console.log('🔍 Raw MYSQL_URL value:', process.env.MYSQL_URL);
console.log('🔍 MYSQL_URL type:', typeof process.env.MYSQL_URL);
console.log('🔍 MYSQL_URL length:', process.env.MYSQL_URL?.length);

if (!process.env.MYSQL_URL) {
  console.error('❌ MYSQL_URL is not defined in environment variables');
  throw new Error('MYSQL_URL is required');
}

// التحقق من صحة الـ URL
try {
  new URL(process.env.MYSQL_URL);
  console.log('✅ MYSQL_URL format is valid');
} catch (error) {
  console.error('❌ Invalid MYSQL_URL format:', process.env.MYSQL_URL);
  console.error('❌ Error details:', error.message);
  throw new Error('Invalid database URL format');
}

// إنشاء pool للاتصالات
let pool;
try {
  pool = mysql.createPool(process.env.MYSQL_URL);
  console.log('✅ Database pool created successfully');
} catch (error) {
  console.error('❌ Failed to create database pool:', error.message);
  throw error;
}

// ✅ التعديل هنا: تصدير pool مباشرة
module.exports = pool;