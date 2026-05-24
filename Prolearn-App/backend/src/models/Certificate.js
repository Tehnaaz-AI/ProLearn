import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    quizAttempt: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    certificateImageUrl: { type: String, trim: true },
    certificateId: { type: String, trim: true, unique: true },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model("Certificate", certificateSchema);
