import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    question: { type: String, required: true },
    answer: String,
    answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    answeredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Doubt", doubtSchema);
