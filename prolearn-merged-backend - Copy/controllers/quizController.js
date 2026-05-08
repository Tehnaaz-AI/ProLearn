const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizAttempt = require('../models/QuizAttempt');
const Enrollment = require('../models/Enrollment'); // mock for solo development

// POST /api/quiz/create  (Instructor only)
// Body: { courseId, topic, title, maxAttempts, questions: [{questionText, options, correctIndex, explanation}] }
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, topic, title, maxAttempts, questions } = req.body;

    // Save each question separately
    const savedQuestions = await Question.insertMany(questions);
    const questionIds = savedQuestions.map(q => q._id);

    const quiz = await Quiz.create({
      course:      courseId,
      topic,
      title,
      questions:   questionIds,
      maxAttempts: maxAttempts || 3,
      createdBy:   req.user._id,
    });

    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quiz/:courseId
exports.getQuizzesByCourse = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId })
      .populate('questions');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quiz/:quizId/attempt
// Body: { answers: [0, 2, 1, 3, ...] }   ← index of chosen option
exports.attemptQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findById(req.params.quizId).populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Check enrollment
    const enrolled = await Enrollment.findOne({ user: req.user._id, course: quiz.course });
    if (!enrolled) return res.status(403).json({ message: 'You must be enrolled to attempt this quiz' });

    // Check attempt limit
    const attemptCount = await QuizAttempt.countDocuments({
      user: req.user._id,
      quiz: quiz._id
    });
    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({ message: `Max ${quiz.maxAttempts} attempts reached` });
    }

    // Auto-evaluate
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    const total      = quiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const attempt = await QuizAttempt.create({
      user:          req.user._id,
      quiz:          quiz._id,
      course:        quiz.course,
      answers,
      score,
      total,
      percentage,
      attemptNumber: attemptCount + 1,
      topic:         quiz.topic,
    });

    // Update progress analytics
    await updateQuizAccuracy(req.user._id, quiz.course);

    res.json({ score, total, percentage, attemptNumber: attemptCount + 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quiz/:quizId/attempts
exports.getAttemptHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      quiz: req.params.quizId
    }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Helper: recalculate quiz accuracy & weak topics ──
async function updateQuizAccuracy(userId, courseId) {
  const Progress = require('../models/Progress');
  const attempts = await QuizAttempt.find({ user: userId, course: courseId });

  if (attempts.length === 0) return;

  const avgAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
  );

  // Weak topic = any topic where average score < 50%
  const topicMap = {};
  attempts.forEach(a => {
    if (!topicMap[a.topic]) topicMap[a.topic] = [];
    topicMap[a.topic].push(a.percentage);
  });
  const weakTopics = Object.entries(topicMap)
    .filter(([, scores]) => {
      const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
      return avg < 50;
    })
    .map(([topic]) => topic);

  await Progress.findOneAndUpdate(
    { user: userId, course: courseId },
    { quizAccuracy: avgAccuracy, weakTopics },
    { upsert: true }
  );
}