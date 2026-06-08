import express from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/token.js";
import { publicUser } from "../utils/formatters.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.single("profilePicture"), asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, phone, city, dob, education, qualifications, experience, bio } = req.body;

  if (!firstName || !lastName || !username || !email || !password || password.length < 6 || !phone || !city) {
    res.status(400);
    throw new Error("First name, last name, username, valid email, 6+ character password, phone, and city are required.");
  }

  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    res.status(400);
    throw new Error("Email is already registered.");
  }

  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error("Username is already taken.");
  }

  const phoneExists = await User.findOne({ phone });
  if (phoneExists) {
    res.status(400);
    throw new Error("Phone number is already registered.");
  }

  let profilePictureUrl = null;
  if (req.file) {
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "ProLearn/profiles",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            profilePictureUrl = result.secure_url;
            resolve();
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });
  }

  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    phone,
    city,
    dob,
    education,
    qualifications,
    experience,
    bio,
    profilePictureUrl,
    passwordHash: await bcrypt.hash(password, 10),
  });
  res.status(201).json({ id: user._id, message: "Registered successfully." });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+passwordHash");
  const valid = user && await bcrypt.compare(password || "", user.passwordHash);
  
  if (!valid) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }
  
  if (user.status === "blocked") {
    res.status(403);
    throw new Error(`Your account has been blocked. Reason: ${user.blockReason || "No reason provided."}`);
  }

  res.json({ token: signToken(user), user: publicUser(user) });
}));

export default router;
