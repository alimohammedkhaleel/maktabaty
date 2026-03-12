
require('dotenv').config();
console.log('✅ Dotenv loaded');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
const express = require('express');
const cors = require('cors');
const initializeDatabase = require('./config/initDB');
const pool = require('./config/db');

// استيراد الروتس
const authRoutes = require('./routes/authRoutes');
const booksRoutes = require('./routes/booksRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');
const path = require('path');

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
// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// quiz routes
app.use('/api/quizzes', quizRoutes);

// مسار الاختبار
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

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
      console.log(`📍 Environment: ${process.env.ENVIRONMENT}`);
      console.log(`🌍 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
