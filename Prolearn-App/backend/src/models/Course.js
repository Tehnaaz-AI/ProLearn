import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    videoUrl: String,
    deleted: { type: Boolean, default: false },
    deletionReason: String
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    answer: Number,
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    level: { type: String, default: "Beginner" },
    price: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "hidden", "deleted"], default: "published" },
    deletionReason: String,
    lessons: [lessonSchema],
    quiz: [quizQuestionSchema],
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", description: "text", category: "text" });

export default mongoose.model("Course", courseSchema);
