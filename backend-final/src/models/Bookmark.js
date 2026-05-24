
import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonIndex: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Bookmark", bookmarkSchema);
