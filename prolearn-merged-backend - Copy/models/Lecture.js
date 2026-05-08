const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  videoUrl: { type: String, required: true },
  duration: { type: Number }, // in minutes
  isPreview: { type: Boolean, default: false }, // free preview?
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Lecture", lectureSchema);