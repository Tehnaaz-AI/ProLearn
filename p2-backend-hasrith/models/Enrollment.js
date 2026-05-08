const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  paymentId: { type: String, default: null }, // filled by Person 3 for paid courses
  enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);