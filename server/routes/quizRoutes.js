const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

// list published quizzes (students)
router.get('/', authMiddleware, quizController.listQuizzes);

// specific endpoints that must come before parameterized routes
router.get('/all', authMiddleware, adminMiddleware, quizController.listAllQuizzes);
router.get('/global-leaderboard', authMiddleware, quizController.getGlobalLeaderboard);

// get quiz details by id (students)
router.get('/:quiz_id', authMiddleware, quizController.getQuiz);

// admin-only endpoints
// create blank quiz record (no questions)
router.post('/', authMiddleware, adminMiddleware, quizController.createQuiz);
router.post('/generate/:book_id', authMiddleware, adminMiddleware, quizController.generateQuiz);
router.post('/publish/:quiz_id', authMiddleware, adminMiddleware, quizController.publishQuiz);
router.delete('/:quiz_id', authMiddleware, adminMiddleware, quizController.deleteQuiz);
// question management
router.put('/question/:question_id', authMiddleware, adminMiddleware, quizController.updateQuestion);
router.delete('/question/:question_id', authMiddleware, adminMiddleware, quizController.deleteQuestion);
router.post('/:quiz_id/question', authMiddleware, adminMiddleware, quizController.addQuestion);
// regenerate existing quiz questions
router.post('/regenerate/:quiz_id', authMiddleware, adminMiddleware, quizController.regenerateQuiz);

// quiz participation
router.post('/submit/:quiz_id', authMiddleware, quizController.submitQuiz);
router.get('/leaderboard/:quiz_id', authMiddleware, quizController.getLeaderboard);

module.exports = router;
