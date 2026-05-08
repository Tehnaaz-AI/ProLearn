const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  topic:       { type: String, required: true },
  title:       { type: String, required: true },
  questions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  maxAttempts: { type: Number, default: 3 },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('Quiz', quizSchema);