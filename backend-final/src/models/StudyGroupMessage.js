
import mongoose from "mongoose";

const studyGroupMessageSchema = new mongoose.Schema(
  {
    studyGroup: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: String,
    videoUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("StudyGroupMessage", studyGroupMessageSchema);
