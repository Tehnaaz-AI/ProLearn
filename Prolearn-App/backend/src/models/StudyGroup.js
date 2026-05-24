
import mongoose from "mongoose";

const studyGroupSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    name: { type: String, required: true },
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: ["active", "deleted"], default: "active" },
    deletionReason: String,
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("StudyGroup", studyGroupSchema);
