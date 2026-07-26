const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// uploads directory: /tmp on Vercel (serverless), local uploads otherwise
const uploadsDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch (_) {}
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

// ── Public routes ─────────────────────────────────────────────────────────────
router.get('/', booksController.getAllBooks);
router.get('/search', booksController.searchBooks);

// ── Protected routes ──────────────────────────────────────────────────────────
// Favorites (must come before /:id to avoid route conflict)
router.get('/favorites', authMiddleware, booksController.getFavorites);
router.post('/favorites/add', authMiddleware, booksController.addToFavorites);
router.delete('/favorites/:book_id', authMiddleware, booksController.removeFromFavorites);

// Book CRUD
router.get('/:id', booksController.getBook);
router.post('/', authMiddleware, adminMiddleware, upload.single('pdf'), booksController.addBook);
router.put('/:id', authMiddleware, booksController.updateBook);
router.delete('/:id', authMiddleware, booksController.deleteBook);

module.exports = router;
