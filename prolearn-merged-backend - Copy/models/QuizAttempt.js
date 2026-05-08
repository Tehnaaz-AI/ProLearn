const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  answers:      [{ type: Number }],    // index of chosen option for each question
  score:        { type: Number },      // number of correct answers
  total:        { type: Number },      // total questions
  percentage:   { type: Number },
  attemptNumber:{ type: Number, required: true },
  topic:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);