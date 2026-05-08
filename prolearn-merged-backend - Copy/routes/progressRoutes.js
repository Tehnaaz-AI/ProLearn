const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  markLectureComplete,
  getCourseProgress,
  getDashboard
} = require('../controllers/progressController');

router.post('/lecture',         protect, markLectureComplete);
router.get('/dashboard',        protect, getDashboard);
router.get('/:courseId',        protect, getCourseProgress);

module.exports = router;