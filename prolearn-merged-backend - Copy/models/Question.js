const mongoose = require('mongoose');
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options:      [{ type: String }],          // array of 4 options
  correctIndex: { type: Number, required: true }, // 0-3
  explanation:  { type: String },
});
module.exports = mongoose.model('Question', questionSchema);