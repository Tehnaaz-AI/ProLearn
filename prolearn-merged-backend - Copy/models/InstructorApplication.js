const mongoose = require("mongoose");

const instructorApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  sampleContent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  reviewedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model("InstructorApplication", instructorApplicationSchema);
