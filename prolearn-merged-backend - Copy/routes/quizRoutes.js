const express = require('express');
const router = express.Router();
const { protect, isInstructor } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuizzesByCourse,
  attemptQuiz,
  getAttemptHistory
} = require('../controllers/quizController');

router.post('/create',              protect, isInstructor, createQuiz);
router.get('/:courseId',            protect, getQuizzesByCourse);
router.post('/:quizId/attempt',     protect, attemptQuiz);
router.get('/:quizId/attempts',     protect, getAttemptHistory);

module.exports = router;