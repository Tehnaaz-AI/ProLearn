const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment'); // mock for solo development
const Lecture = require('../models/Lecture');    // mock for solo development
const Course = require('../models/Course'); // mock for solo development

// POST /api/progress/lecture
// Body: { courseId, lectureId }
exports.markLectureComplete = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;

    const enrolled = await Enrollment.findOne({ student: req.user.id, course: courseId });
    if (!enrolled) return res.status(403).json({ message: 'Not enrolled in this course' });

    let progress = await Progress.findOne({ user: req.user.id, course: courseId });
    if (!progress) {
      progress = await Progress.create({ user: req.user.id, course: courseId });
    }

    // Add lecture if not already marked
    if (!progress.completedLectures.includes(lectureId)) {
      progress.completedLectures.push(lectureId);
    }

    // Recalculate completion %
    // const course = await Course.findById(courseId).populate({
    //   path: 'sections',
    //   populate: { path: 'lectures' }
    // });

    // Mock course with totalLectures
    const totalLectures = 10; // mock

    // let totalLectures = 0;
    // course.sections.forEach(s => { totalLectures += s.lectures.length; });

    progress.completionPercent = totalLectures > 0
      ? Math.round((progress.completedLectures.length / totalLectures) * 100)
      : 0;

    progress.lastUpdated = Date.now();
    await progress.save();

    res.json({
      completedLectures: progress.completedLectures.length,
      totalLectures,
      completionPercent: progress.completionPercent
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/progress/:courseId
exports.getCourseProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user:   req.user.id,
      course: req.params.courseId
    });
    if (!progress) return res.json({ completionPercent: 0, quizAccuracy: 0, weakTopics: [] });

    // Get all quiz attempts for this course
    const attempts = await QuizAttempt.find({
      user:   req.user.id,
      course: req.params.courseId
    });

    res.json({
      completionPercent:  progress.completionPercent,
      quizAccuracy:       progress.quizAccuracy,
      weakTopics:         progress.weakTopics,
      lecturesCompleted:  progress.completedLectures.length,
      totalQuizAttempts:  attempts.length,
      lastUpdated:        progress.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/progress/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const allProgress = await Progress.find({ user: req.user.id })
      .populate('course', 'title thumbnail');

    const dashboard = allProgress.map(p => ({
      course:            p.course?.title || 'Unknown Course',
      completionPercent: p.completionPercent,
      quizAccuracy:      p.quizAccuracy,
      weakTopics:        p.weakTopics,
    }));

    const overallAccuracy = allProgress.length > 0
      ? Math.round(allProgress.reduce((s, p) => s + p.quizAccuracy, 0) / allProgress.length)
      : 0;

    res.json({ coursesEnrolled: allProgress.length, overallAccuracy, courses: dashboard });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};