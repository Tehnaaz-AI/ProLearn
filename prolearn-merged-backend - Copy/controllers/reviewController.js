const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');

const MIN_PROGRESS_TO_REVIEW = 25; // must complete 25% before reviewing

// POST /api/review/:courseId
// Body: { rating: 4, review: 'Great course!' }
exports.addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, review } = req.body;

    // Must be enrolled
    const enrolled = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrolled) return res.status(403).json({ message: 'Enroll in the course first' });

    // Must have minimum progress
    const progress = await Progress.findOne({ user: req.user._id, course: courseId });
    const completionPct = progress?.completionPercent || 0;
    if (completionPct < MIN_PROGRESS_TO_REVIEW) {
      return res.status(403).json({
        message: `Complete at least ${MIN_PROGRESS_TO_REVIEW}% of the course to review`
      });
    }

    // Upsert: update if already reviewed, create if not
    const existing = await Review.findOne({ user: req.user._id, course: courseId });
    if (existing) {
      existing.rating = rating;
      existing.review = review;
      await existing.save();
      return res.json({ message: 'Review updated', review: existing });
    }

    const newReview = await Review.create({
      user: req.user._id,
      course: courseId,
      rating,
      review
    });
    res.status(201).json({ message: 'Review submitted', review: newReview });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/review/:courseId  (public — no login needed)
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    res.json({ avgRating, totalReviews: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};