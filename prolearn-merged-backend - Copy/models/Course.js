const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: true },
  thumbnail: { type: String },
  category: { type: String },
  tags: [String],
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Course", courseSchema);