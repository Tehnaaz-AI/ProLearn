const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:            { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }],
  completionPercent: { type: Number, default: 0 },
  quizAccuracy:      { type: Number, default: 0 },  // average % across all quizzes
  weakTopics:        [{ type: String }],
  lastUpdated:       { type: Date, default: Date.now },
}, { timestamps: true });

// Unique: one progress doc per user per course
progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);