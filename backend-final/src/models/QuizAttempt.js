import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    score: Number,
    total: Number,
    answers: [Number],
  },
  { timestamps: true }
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
