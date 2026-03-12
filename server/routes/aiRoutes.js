const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');

// طرح الأسئلة
router.post('/ask', authMiddleware, aiController.askQuestion);

// الحصول على التاريخ
router.get('/history', authMiddleware, aiController.getQAHistory);

// توليد الأسئلة التلقائية
router.get('/auto-questions/:book_id', authMiddleware, aiController.generateAutoQuestions);

// البحث في الكتب
router.get('/search', aiController.searchInBooks);

module.exports = router;
