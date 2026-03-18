require('dotenv').config();
console.log('✅ Dotenv loaded');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('MYSQL_URL exists:', !!process.env.MYSQL_URL);

const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./config/initDB');
const pool = require('./config/db');
const path = require('path');

// استيراد الروتس
const authRoutes = require('./routes/authRoutes');
const booksRoutes = require('./routes/booksRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, 'https://maktabaty.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// تسجيل الطلبات
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/ai', aiRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/quizzes', quizRoutes);

// مسار الاختبار
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// مسار لاختبار اتصال قاعدة البيانات
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute('SELECT 1 as test');
    connection.release();
    res.json({
      success: true,
      message: '✅ Database connected successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Database connection failed',
      error: error.message
    });
  }
});

// ❌ تم إزالة كود خدمة React Frontend لأنه أصبح على Vercel

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.ENVIRONMENT === 'development' ? err.message : undefined
  });
});

// بدء السيرفر
const startServer = async () => {
  try {
    // تحقق من وجود MYSQL_URL
    if (!process.env.MYSQL_URL) {
      throw new Error('MYSQL_URL is not defined in environment variables');
    }
    console.log('✅ MYSQL_URL is defined');

    // تهيئة قاعدة البيانات
    console.log('🔄 Initializing database...');
    await initializeDatabase();

    // اختبار الاتصال
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    connection.release();

    // بدء السيرفر
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.ENVIRONMENT || 'development'}`);
      console.log(`🌍 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
      // console.log(`📱 React Frontend: http://localhost:${PORT}`); // تم إزالة هذا السطر أيضًا
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;