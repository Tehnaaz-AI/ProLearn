import express from "express";
import InstructorApplication from "../models/InstructorApplication.js";
import Course from "../models/Course.js";
import Doubt from "../models/Doubt.js";
import Review from "../models/Review.js";
import Enrollment from "../models/Enrollment.js";
import { protect, allow } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { courseDto } from "../utils/formatters.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/instructor/status", protect, allow("student"), asyncHandler(async (req, res) => {
  const app = await InstructorApplication.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  if (!app) return res.json({ application: null });
  res.json({
    application: {
      status: app.status,
      adminReason: app.adminReason,
    },
  });
}));

router.post("/instructor/apply", protect, allow("student"), upload.single("sample_video"), asyncHandler(async (req, res) => {
  const {
    name,
    email,
    dob,
    education,
    qualifications,
    experience,
    bio,
    sample_courses,
    payout_method,
    payout_details,
  } = req.body;
  if (![name, email, dob, education, qualifications, experience, bio, sample_courses, payout_method, payout_details].every(Boolean)) {
    res.status(400);
    throw new Error("All instructor application fields are required.");
  }
  if (!req.file) {
    res.status(400);
    throw new Error("Sample video file is required.");
  }

  let videoUrl = null;
  await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "ProLearn/applications",
      },
      (error, result) => {
        if (error) reject(error);
        else {
          videoUrl = result.playback_url || result.secure_url;
          resolve();
        }
      }
    );
    uploadStream.end(req.file.buffer);
  });

  await InstructorApplication.create({
    user: req.user._id,
    name,
    email,
    dob,
    education,
    qualifications,
    experience,
    bio,
    sampleCourses: sample_courses,
    sampleVideos: videoUrl,
    payoutMethod: payout_method,
    payoutDetails: payout_details,
  });
  res.status(201).json({ message: "Application sent for admin approval." });
}));

router.get("/instructor/applications", protect, allow("admin"), asyncHandler(async (req, res) => {
  const applications = await InstructorApplication.find({ status: "pending" }).populate("user", "username email").sort({ createdAt: -1 });
  res.json({
    applications: applications.map((app) => ({
      id: app._id,
      user_id: app.user?._id,
      username: app.user?.username,
      email: app.user?.email,
      name: app.name,
      instructor_email: app.email,
      dob: app.dob,
      education: app.education,
      qualifications: app.qualifications,
      experience: app.experience,
      bio: app.bio,
      sample_courses: app.sampleCourses,
      sample_videos: app.sampleVideos,
      payout_method: app.payoutMethod,
      payout_details: app.payoutDetails,
      status: app.status,
      admin_reason: app.adminReason,
      created_at: app.createdAt,
    })),
  });
}));

router.post("/instructor/applications/:id/:action", protect, allow("admin"), asyncHandler(async (req, res) => {
  const { id, action } = req.params;
  const app = await InstructorApplication.findById(id).populate("user");
  if (!app || !["approve", "reject"].includes(action)) {
    res.status(404);
    throw new Error("Application not found.");
  }

  if (action === "approve") {
    app.user.role = "instructor";
    app.user.username = app.name;
    app.user.dob = app.dob;
    app.user.education = app.education;
    app.user.qualifications = app.qualifications;
    app.user.experience = app.experience;
    app.user.bio = app.bio;
    app.user.payoutMethod = app.payoutMethod;
    app.user.payoutDetails = app.payoutDetails;
    await app.user.save();
    app.status = "approved";
    app.adminReason = req.body.reason || "Approved";
  } else {
    app.status = "rejected";
    app.adminReason = req.body.reason || "Rejected by admin";
  }

  await app.save();
  res.json({ message: `Application ${app.status}.` });
}));

router.get("/my/courses", protect, allow("instructor"), asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate("instructor", "username").sort({ createdAt: -1 });
  res.json({ courses: courses.map((course) => courseDto(course)) });
}));

router.get("/instructor/doubts", protect, allow("instructor"), asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).select("_id");
  const courseIds = courses.map((course) => course._id);
  const doubts = await Doubt.find({ course: { $in: courseIds } })
    .populate("course", "title")
    .populate("user", "username")
    .sort({ createdAt: -1 });

  res.json({
    doubts: doubts.map((doubt) => ({
      id: doubt._id,
      course_id: doubt.course?._id,
      title: doubt.course?.title,
      username: doubt.user?.username,
      question: doubt.question,
      answer: doubt.answer,
      created_at: doubt.createdAt,
      answered_at: doubt.answeredAt,
    })),
  });
}));

router.post("/doubts/:id/answer", protect, allow("instructor"), asyncHandler(async (req, res) => {
  const doubt = await Doubt.findById(req.params.id).populate("course");
  if (!doubt) {
    res.status(404);
    throw new Error("Doubt not found.");
  }
  if (String(doubt.course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the course instructor can answer.");
  }
  doubt.answer = req.body.answer;
  doubt.answeredBy = req.user._id;
  doubt.answeredAt = new Date();
  await doubt.save();
  res.json({ message: "Answer posted." });
}));

router.get("/instructor/courses/details", protect, allow("instructor"), asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).populate("instructor", "username").sort({ createdAt: -1 });
  const details = await Promise.all(courses.map(async (course) => {
    const [doubts, reviews, enrollments] = await Promise.all([
      Doubt.find({ course: course._id }).populate("user", "username").sort({ createdAt: -1 }),
      Review.find({ course: course._id }).populate("user", "username").sort({ createdAt: -1 }),
      Enrollment.countDocuments({ course: course._id }),
    ]);
    const averageRating = reviews.length ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length : 0;
    return courseDto(course, {
      enrollment_count: enrollments,
      enrollmentCount: enrollments,
      average_rating: averageRating,
      averageRating,
      reviews: reviews.map((review) => ({ id: review._id, stars: review.stars, comment: review.comment, username: review.user?.username, created_at: review.createdAt })),
      doubts: doubts.map((doubt) => ({ id: doubt._id, username: doubt.user?.username, question: doubt.question, answer: doubt.answer, created_at: doubt.createdAt })),
    });
  }));
  res.json({ courses: details });
}));

export default router;
