const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { addReview, getReviews } = require('../controllers/reviewController');

router.post('/:courseId',  protect, addReview);
router.get('/:courseId',           getReviews);

module.exports = router;