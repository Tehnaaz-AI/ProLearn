import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    blockReason: String,
    phone: { type: String, trim: true, unique: true, sparse: true },
    city: { type: String, trim: true },
    dob: Date,
    education: String,
    qualifications: String,
    experience: String,
    bio: String,
    paymentDetails: String,
    profilePictureUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
