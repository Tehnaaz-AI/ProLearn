import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { publicUser } from "../utils/formatters.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/me", protect, asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
}));

router.put("/me", protect, upload.single("profilePicture"), asyncHandler(async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    phone,
    city,
    current_password,
    new_password,
    dob,
    education,
    qualifications,
    experience,
    bio,
    payout_method,
    payout_details,
  } = req.body;
  
  req.user.username = username !== undefined && username !== null && username !== "" ? username : req.user.username;
  req.user.firstName = firstName !== undefined && firstName !== null && firstName !== "" ? firstName : req.user.firstName;
  req.user.lastName = lastName !== undefined && lastName !== null && lastName !== "" ? lastName : req.user.lastName;
  if (phone !== undefined) req.user.phone = phone;
  if (city !== undefined) req.user.city = city;
  if (dob) req.user.dob = dob;
  if (education !== undefined) req.user.education = education;
  if (qualifications !== undefined) req.user.qualifications = qualifications;
  if (experience !== undefined) req.user.experience = experience;
  if (bio !== undefined) req.user.bio = bio;
  
  if (req.file) {
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "ProLearn/profiles",
        },
        (error, result) => {
          if (error) reject(error);
          else {
            req.user.profilePictureUrl = result.secure_url;
            resolve();
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });
  }
  
  if (["instructor", "admin"].includes(req.user.role)) {
    if (payout_method !== undefined) req.user.payoutMethod = payout_method;
    if (payout_details !== undefined) req.user.payoutDetails = payout_details;
  }

  if (new_password) {
    const ok = await bcrypt.compare(current_password || "", req.user.passwordHash);
    if (!ok) {
      res.status(403);
      throw new Error("Current password verification failed.");
    }
    req.user.passwordHash = await bcrypt.hash(new_password, 10);
  }

  await req.user.save();
  res.json({ message: "Profile updated. Email cannot be changed." });
}));

export default router;
