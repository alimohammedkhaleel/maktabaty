require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const initializeDatabase = require('./config/initDB');

// Routes
const authRoutes  = require('./routes/authRoutes');
const booksRoutes = require('./routes/booksRoutes');
const aiRoutes    = require('./routes/aiRoutes');
const quizRoutes  = require('./routes/quizRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL,
      'https://maktabatyy.vercel.app',
      'https://maktabaty.vercel.app'
    ].filter(Boolean)
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
    }
  },
  credentials: true
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ─── Static Files (uploads - local only) ─────────────────────────────────────
if (!process.env.VERCEL) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/books',   booksRoutes);
app.use('/api/ai',      aiRoutes);
app.use('/api/quizzes', quizRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Maktabaty API is running 🚀',
    database: 'Neon PostgreSQL',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Serverless + Local Startup ───────────────────────────────────────────────
// When running as a Vercel Serverless Function, we export the app directly.
// When running locally (node index.js), we initialize DB and start listening.

if (require.main === module) {
  // Local development
  const startServer = async () => {
    try {
      console.log('🔄 Initializing Neon PostgreSQL database...');
      await initializeDatabase();
      app.listen(PORT, () => {
        console.log(`🚀 Server started on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌍 API: http://localhost:${PORT}/api`);
        console.log(`💊 Health: http://localhost:${PORT}/api/health`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };
  startServer();
} else {
  // Vercel Serverless: initialize DB lazily on first request
  let dbInitialized = false;
  const originalApp = app;

  // Wrap app to initialize DB on first request
  const wrappedApp = async (req, res) => {
    if (!dbInitialized) {
      try {
        await initializeDatabase();
        dbInitialized = true;
      } catch (err) {
        console.error('DB init error on cold start:', err.message);
      }
    }
    return originalApp(req, res);
  };

  module.exports = wrappedApp;
}

module.exports = app;
