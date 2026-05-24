
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { 
      type: String, 
      enum: ["content_deleted", "user_blocked", "user_deleted"], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    reason: { type: String },
    contentType: { 
      type: String, 
      enum: ["course", "lesson", "post", "group"] 
    },
    contentTitle: { type: String },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
