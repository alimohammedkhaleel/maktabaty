const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadsDir);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, unique + path.extname(file.originalname));
	}
});

const upload = multer({ storage });

// المسارات المفتوحة
router.get('/', booksController.getAllBooks);
router.get('/search', booksController.searchBooks);
router.get('/:id', booksController.getBook);

// المسارات المحمية
// إضافة كتاب: يتوقع الحقول العادية وملف pdf كـ multipart form-data (حقول name="pdf")
router.post('/', authMiddleware, adminMiddleware, upload.single('pdf'), booksController.addBook);
router.put('/:id', authMiddleware, booksController.updateBook);
router.delete('/:id', authMiddleware, booksController.deleteBook);

// المفضلة
router.post('/favorites/add', authMiddleware, booksController.addToFavorites);
router.delete('/favorites/:book_id', authMiddleware, booksController.removeFromFavorites);

module.exports = router;
