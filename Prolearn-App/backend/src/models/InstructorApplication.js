import mongoose from "mongoose";

const instructorApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    dob: { type: Date, required: true },
    education: { type: String, required: true },
    qualifications: { type: String, required: true },
    experience: { type: String, required: true },
    bio: { type: String, required: true },
    sampleCourses: { type: String, required: true },
    sampleVideos: { type: String, required: true },
    payoutMethod: { type: String, enum: ["bank", "upi", "mobile"], required: true },
    payoutDetails: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("InstructorApplication", instructorApplicationSchema);
