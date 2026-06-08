import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import QRCode from "qrcode";
import Razorpay from "razorpay";
import cloudinary from "../config/cloudinary.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import Doubt from "../models/Doubt.js";
import Payment from "../models/Payment.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Progress from "../models/Progress.js";
import Certificate from "../models/Certificate.js";
import Leaderboard from "../models/Leaderboard.js";
import { createCanvas } from "canvas";
import { protect, allow } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { courseDto } from "../utils/formatters.js";


const router = express.Router();
fs.mkdirSync("uploads/videos", { recursive: true });
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) return cb(new Error("Only video files are allowed."));
    cb(null, true);
  },
  limits: { fileSize: 250 * 1024 * 1024 },
});

async function enrolled(userId, courseId) {
  return Boolean(await Enrollment.findOne({ user: userId, course: courseId }));
}

async function canAccessCourseContent(req, course) {
  if (!req.user) return false;
  if (req.user.role === "admin") return true;
  if (String(course.instructor?._id || course.instructor) === String(req.user._id)) return true;
  return enrolled(req.user._id, course._id);
}

function normalizeCourseBody(body) {
  const price = Number(body.price || 0);
  return {
    title: body.title,
    category: body.category || "General",
    description: body.description,
    level: body.level || "Beginner",
    price,
    isPaid: price > 0 || Boolean(body.is_paid || body.isPaid),
    lessons: Array.isArray(body.lessons) ? body.lessons : [],
    quiz: Array.isArray(body.quiz) ? body.quiz : [],
    status: body.status || "published",
  };
}

router.get("/courses", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  const filter = { status: "published" };
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const courses = await Course.find(filter).populate("instructor", "username").sort({ createdAt: -1 });
  let tokenUser = null;
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "change-this-secret");
      tokenUser = await User.findById(decoded.id);
      if (tokenUser?.status !== "active") tokenUser = null;
    } catch {
      tokenUser = null;
    }
  }
  const payload = await Promise.all(courses.map(async (course) => {
    const [reviewStats, enrollmentCount] = await Promise.all([
      Review.aggregate([
        { $match: { course: course._id } },
        { $group: { _id: "$course", average: { $avg: "$stars" } } },
      ]),
      Enrollment.countDocuments({ course: course._id }),
    ]);
    const isEnrolled = tokenUser ? await enrolled(tokenUser._id, course._id) : false;
    return courseDto(course, {
      average_rating: reviewStats[0]?.average || 0,
      averageRating: reviewStats[0]?.average || 0,
      enrollment_count: enrollmentCount,
      enrollmentCount,
      is_enrolled: isEnrolled,
      isEnrolled,
    });
  }));

  res.json({ courses: payload });
}));

router.post("/courses", protect, allow("instructor"), asyncHandler(async (req, res) => {
  const payload = normalizeCourseBody(req.body);
  if (!payload.title || !payload.description) {
    res.status(400);
    throw new Error("Course title and description are required.");
  }
  const course = await Course.create({ ...payload, instructor: req.user._id });
  res.status(201).json({ id: course._id, message: "Course created." });
}));

router.get("/courses/:id", asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor", "username email bio qualifications experience education");
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }

  let tokenUser = null;
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "change-this-secret");
      tokenUser = await User.findById(decoded.id);
      if (tokenUser?.status !== "active") tokenUser = null;
    } catch {
      tokenUser = null;
    }
  }
  const isEnrolled = tokenUser ? await enrolled(tokenUser._id, course._id) : false;
  const unlocked = (() => {
    if (!tokenUser) return false;
    if (tokenUser.role === "admin") return true;
    if (String(course.instructor?._id || course.instructor) === String(tokenUser._id)) return true;
    return isEnrolled;
  })();

  let payment = null;
  if (tokenUser && isEnrolled) {
    payment = await Payment.findOne({ user: tokenUser._id, course: course._id, status: "paid" });
  }

  const [reviews, doubts] = await Promise.all([
    Review.find({ course: course._id }).populate("user", "username").sort({ createdAt: -1 }),
    unlocked ? Doubt.find({ course: course._id }).populate("user", "username").sort({ createdAt: -1 }) : [],
  ]);

  const paymentData = payment ? {
    order_id: payment.providerOrderId || payment._id,
    amount: payment.amount,
    created_at: payment.createdAt
  } : null;

  const finalCourse = courseDto(course, {
    locked: !unlocked,
    is_enrolled: isEnrolled,
    isEnrolled: isEnrolled,
    payment: paymentData,
    lessons: unlocked ? course.lessons : [],
    quiz: unlocked ? course.quiz : [],
    reviews: reviews.map((review) => ({
      id: review._id,
      stars: review.stars,
      comment: review.comment,
      username: review.user?.username,
      created_at: review.createdAt,
    })),
    doubts: doubts.map((doubt) => ({
      id: doubt._id,
      username: doubt.user?.username,
      question: doubt.question,
      answer: doubt.answer,
      created_at: doubt.createdAt,
      answered_at: doubt.answeredAt,
    })),
  });



  res.json({ course: finalCourse });
}));

router.delete("/courses/:id", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (req.user.role !== "admin" && String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the owner or admin can delete this course.");
  }

  const isOwnCourse = String(course.instructor) === String(req.user._id);
  if (!isOwnCourse && !req.body.reason) {
    res.status(400);
    throw new Error("Deletion reason is required.");
  }

  const instructorId = course.instructor;
  const courseTitle = course.title;

  await Course.findByIdAndUpdate(req.params.id, {
    status: "deleted",
    deletionReason: req.body.reason || "Deleted by owner"
  });

  if (!isOwnCourse) {
    const Notification = (await import("../models/Notification.js")).default;
    const notification = new Notification({
      user: instructorId,
      type: "content_deleted",
      title: "Course Deleted",
      message: `Your course "${courseTitle}" has been deleted.`,
      reason: req.body.reason,
      contentType: "course",
      contentTitle: courseTitle
    });
    await notification.save();
  }

  res.json({ message: "Course deleted." });
}));

router.delete("/courses/:id/lessons/:lessonIndex", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (req.user.role !== "admin" && String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the owner or admin can delete lessons.");
  }
  const lessonIndex = Number(req.params.lessonIndex);
  if (isNaN(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.lessons.length) {
    res.status(400);
    throw new Error("Invalid lesson index.");
  }

  const isOwnCourse = String(course.instructor) === String(req.user._id);
  if (!isOwnCourse && !req.body.reason) {
    res.status(400);
    throw new Error("Deletion reason is required.");
  }

  const lesson = course.lessons[lessonIndex];
  const instructorId = course.instructor;
  const lessonTitle = lesson.title || "Untitled lesson";

  course.lessons[lessonIndex].deleted = true;
  course.lessons[lessonIndex].deletionReason = req.body.reason || "Deleted by owner";
  await course.save();

  if (!isOwnCourse) {
    const Notification = (await import("../models/Notification.js")).default;
    const notification = new Notification({
      user: instructorId,
      type: "content_deleted",
      title: "Lesson Deleted",
      message: `Your lesson "${lessonTitle}" in course "${course.title}" has been deleted.`,
      reason: req.body.reason,
      contentType: "lesson",
      contentTitle: lessonTitle
    });
    await notification.save();
  }

  res.json({ message: "Lesson deleted." });
}));

router.put("/courses/:id", protect, allow("instructor", "admin"), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (req.user.role !== "admin" && String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the owner can update this course.");
  }
  Object.assign(course, normalizeCourseBody({ ...course.toObject(), ...req.body }));
  await course.save();
  res.json({ message: "Course updated." });
}));

router.post("/courses/upload-video", protect, allow("instructor", "admin"), upload.single("video"), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Video file is required.");
  }

  let videoUrl = null;
  await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "ProLearn/videos",
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

  res.json({ videoUrl });
}));

router.post("/courses/:id/videos", protect, allow("instructor"), upload.single("video"), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (String(course.instructor) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only the course instructor can upload videos.");
  }
  const lessonIndex = Number(req.body.lessonIndex || 0);
  if (!course.lessons[lessonIndex]) {
    course.lessons.push({ title: req.body.title || "Uploaded video", content: req.body.content || "" });
  }

  // Upload video to Cloudinary
  if (req.file) {
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "ProLearn/videos",
        },
        (error, result) => {
          if (error) reject(error);
          else {
            course.lessons[lessonIndex].videoUrl = result.playback_url || result.secure_url;
            resolve();
          }
        }
      );
      if (!req.file?.buffer) {
        throw new Error("Video file missing.");
      }

      uploadStream.end(req.file.buffer);
    });
  }

  await course.save();
  res.status(201).json({ message: "Video saved.", lesson: course.lessons[lessonIndex] });
}));

router.post("/courses/:id/enroll", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (String(course.instructor) === String(req.user._id)) {
    res.status(403);
    throw new Error("Instructors cannot enroll in their own courses.");
  }
  let payment = null;
  if (course.isPaid) {
    payment = await Payment.findOne({ _id: req.body.payment_id, user: req.user._id, course: course._id, status: "paid" });
    if (!payment) {
      res.status(402);
      throw new Error("Paid course requires a verified payment.");
    }
  }
  await Enrollment.updateOne(
    { user: req.user._id, course: course._id },
    { $setOnInsert: { user: req.user._id, course: course._id, payment: payment?._id } },
    { upsert: true }
  );
  res.json({ message: "Enrolled successfully." });
}));

router.get("/my/enrollments", protect, asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate({ path: "course", populate: { path: "instructor", select: "username" } }).sort({ createdAt: -1 });
  res.json({ courses: enrollments.map((enrollment) => courseDto(enrollment.course, { enrolled_at: enrollment.createdAt, is_enrolled: true, isEnrolled: true })) });
}));

router.post("/courses/:id/reviews", protect, asyncHandler(async (req, res) => {
  const stars = Number(req.body.stars);
  if (stars < 1 || stars > 5) {
    res.status(400);
    throw new Error("Stars must be between 1 and 5.");
  }
  if (!await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before reviewing.");
  }
  await Review.findOneAndUpdate(
    { user: req.user._id, course: req.params.id },
    { stars, comment: req.body.comment || "" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json({ message: "Review saved." });
}));

router.post("/courses/:id/doubts", protect, asyncHandler(async (req, res) => {
  if (!await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before posting a doubt.");
  }
  if (!req.body.question) {
    res.status(400);
    throw new Error("Question is required.");
  }
  await Doubt.create({ user: req.user._id, course: req.params.id, question: req.body.question });
  res.status(201).json({ message: "Doubt sent to instructor." });
}));

router.get("/courses/:id/quiz/attempts", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const isInstructor = String(course?.instructor) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  
  if (!isInstructor && !isAdmin && !await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before viewing quiz attempts.");
  }

  const attempts = await QuizAttempt.find({ 
    user: req.user._id, 
    course: req.params.id 
  }).sort({ createdAt: -1 });
  res.json({ 
    attempts: attempts.map(attempt => ({
      id: attempt._id,
      score: attempt.score,
      total: attempt.total,
      answers: attempt.answers,
      created_at: attempt.createdAt,
      createdAt: attempt.createdAt
    }))
  });
}));

router.get("/courses/:id/progress", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const isInstructor = String(course?.instructor) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  
  if (!isInstructor && !isAdmin && !await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before viewing progress.");
  }
  
  let progress = await Progress.findOne({ user: req.user._id, course: req.params.id });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: req.params.id });
  }
  
  const allLessonsWatched = course.lessons.length > 0 && course.lessons.every((_, idx) => progress.watchedLessons.includes(idx));
  const hasQuizAttempt = await QuizAttempt.findOne({ user: req.user._id, course: req.params.id }).sort({ createdAt: -1 });
  
  res.json({ 
    progress: {
      id: progress._id,
      watchedLessons: progress.watchedLessons,
      allLessonsWatched,
      latestQuizAttempt: hasQuizAttempt ? {
        score: hasQuizAttempt.score,
        total: hasQuizAttempt.total,
        createdAt: hasQuizAttempt.createdAt,
      } : null,
    },
  });
}));

async function calculateUserTotalXP(userId) {
  // Get all progress entries
  const progressEntries = await Progress.find({ user: userId });
  
  // Get all certificates
  const certificates = await Certificate.find({ user: userId });
  
  let totalXP = 0;
  
  // XP from lessons
  for (const progress of progressEntries) {
    totalXP += progress.watchedLessons.length * 50;
  }
  
  // XP from completed courses (all lessons watched)
  for (const progress of progressEntries) {
    const course = await Course.findById(progress.course);
    if (course && course.lessons.length > 0 && 
        progress.watchedLessons.length === course.lessons.length) {
      totalXP += 500;
    }
  }
  
  // XP from certificates
  totalXP += certificates.length * 1000;
  
  return totalXP;
}

async function updateLeaderboardForUser(userId) {
  // Get all progress entries
  const progressEntries = await Progress.find({ user: userId });
  
  // Update per-course leaderboard entries
  for (const progress of progressEntries) {
    const course = await Course.findById(progress.course);
    const completedLessons = progress.watchedLessons.length;
    
    // Calculate course XP
    let courseXP = completedLessons * 50;
    if (course && course.lessons.length > 0 && completedLessons === course.lessons.length) {
      courseXP += 500;
    }
    
    const level = Math.floor(courseXP / 500) + 1;
    
    let leaderboardEntry = await Leaderboard.findOne({
      user: userId,
      course: progress.course
    });
    
    if (!leaderboardEntry) {
      leaderboardEntry = await Leaderboard.create({
        user: userId,
        course: progress.course,
        xp: courseXP,
        level,
        completedLessons,
        score: courseXP
      });
    } else {
      leaderboardEntry.xp = courseXP;
      leaderboardEntry.level = level;
      leaderboardEntry.completedLessons = completedLessons;
      leaderboardEntry.score = courseXP;
      await leaderboardEntry.save();
    }
  }
}

router.post("/courses/:id/progress/watch-lesson", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const isInstructor = String(course?.instructor) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  
  if (!isInstructor && !isAdmin && !await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before tracking progress.");
  }
  
  const lessonIndex = Number(req.body.lessonIndex);
  if (isNaN(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.lessons.length) {
    res.status(400);
    throw new Error("Invalid lesson index.");
  }
  
  let progress = await Progress.findOne({ user: req.user._id, course: req.params.id });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: req.params.id });
  }
  
  if (!progress.watchedLessons.includes(lessonIndex)) {
    progress.watchedLessons.push(lessonIndex);
    await progress.save();
    
    // Update leaderboard for this user
    await updateLeaderboardForUser(req.user._id);
  }
  
  res.json({ message: "Lesson marked as watched." });
}));

async function generateCertificateJpeg(userFullName, courseTitle, instructorName, score, total, issuedDate, certificateId) {
  const width = 1414;
  const height = 1000;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const wrapText = (text, maxWidth) => {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";
    for (let word of words) {
      let testLine = currentLine + (currentLine ? " " : "") + word;
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, "#ffffff");
  bgGradient.addColorStop(0.5, "#f8fafc");
  bgGradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(99, 102, 241, 0.07)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 100, 0);
    ctx.lineTo(i * 100 + 50, height);
    ctx.stroke();
  }
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 80);
    ctx.lineTo(width, i * 80 + 40);
    ctx.stroke();
  }

  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, width - 100, height - 100);

  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  ctx.font = "bold 48px 'Georgia', serif";
  ctx.fillStyle = "#1e3a8a";
  ctx.fillText("ProLearn Academy", width / 2, 130);

  ctx.font = "italic 22px 'Georgia', serif";
  ctx.fillStyle = "#6366f1";
  ctx.fillText("Learn. Build. Achieve.", width / 2, 170);

  ctx.font = "bold 64px 'Times New Roman', serif";
  ctx.fillStyle = "#1e3a8a";
  ctx.fillText("CERTIFICATE OF COMPLETION", width / 2, 240);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, 280);
  ctx.lineTo(width / 2 + 280, 280);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 290);
  ctx.lineTo(width / 2 + 250, 290);
  ctx.stroke();

  ctx.font = "26px 'Georgia', serif";
  ctx.fillStyle = "#475569";
  ctx.fillText("This certifies that", width / 2, 350);

  ctx.font = "bold 72px 'Times New Roman', serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText(userFullName || "JOHN DOE", width / 2, 420);

  ctx.font = "24px 'Georgia', serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText("has successfully completed the course and demonstrated outstanding performance", width / 2, 480);

  ctx.font = "bold 36px 'Times New Roman', serif";
  ctx.fillStyle = "#1e3a8a";
  const courseLines = wrapText(courseTitle || "ProLearn Course", 1200);
  let courseY = 550;
  for (let line of courseLines) {
    ctx.fillText(line, width / 2, courseY);
    courseY += 45;
  }

  const completionDate = issuedDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  let detailsY = courseY + 30;

  ctx.textBaseline = "middle";

  const leftMargin = 150;
  const rightMargin = width - 150;

  ctx.textAlign = "left";
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 22px 'Georgia', serif";
  ctx.fillText("Course:", leftMargin, detailsY);
  ctx.fillStyle = "#475569";
  ctx.font = "20px 'Georgia', serif";
  ctx.fillText(courseTitle, leftMargin + 120, detailsY);

  ctx.textAlign = "right";
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 22px 'Georgia', serif";
  ctx.fillText("Completion Date:", rightMargin, detailsY);
  ctx.fillStyle = "#475569";
  ctx.font = "20px 'Georgia', serif";
  ctx.fillText(completionDate, rightMargin, detailsY + 40);

  ctx.textAlign = "left";
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 22px 'Georgia', serif";
  ctx.fillText("Final Score:", leftMargin, detailsY + 40);
  ctx.fillStyle = "#475569";
  ctx.font = "20px 'Georgia', serif";
  ctx.fillText(`${percentage}%`, leftMargin + 140, detailsY + 40);

  ctx.textAlign = "left";
  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 22px 'Georgia', serif";
  ctx.fillText("Certificate ID:", leftMargin, detailsY + 80);
  ctx.fillStyle = "#475569";
  ctx.font = "20px 'Georgia', serif";
  ctx.fillText(certificateId, leftMargin + 160, detailsY + 80);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const sealX = 150;
  const sealY = height - 220;
  ctx.save();
  ctx.translate(sealX + 40, sealY + 40);
  ctx.rotate(-Math.PI / 4);
  ctx.font = "bold 14px 'Georgia', serif";
  ctx.fillStyle = "#d97706";
  ctx.fillText("VERIFIED BY", -40, -5);
  ctx.fillText("PROLEARN", -40, 15);
  ctx.restore();
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(sealX + 40, sealY + 40, 50, 0, Math.PI * 2);
  ctx.stroke();

  const signatureY = height - 170;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  ctx.font = "bold 20px 'Georgia', serif";
  ctx.fillStyle = "#1e3a8a";
  ctx.fillText("Course Instructor", width / 2, signatureY);
  
  if (instructorName) {
    ctx.font = "bold 24px 'Georgia', serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(instructorName, width / 2, signatureY + 50);
  }
  
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, signatureY + 25);
  ctx.lineTo(width / 2 + 200, signatureY + 25);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = "16px 'Georgia', serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Verify this certificate at: prolearn.com/verify", width / 2, height - 60);

  return canvas.toBuffer("image/jpeg", { quality: 0.98 });
}

router.post("/courses/:id/quiz/submit", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor", "firstName lastName username");
  const isInstructor = String(course?.instructor?._id || course?.instructor) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  
  if (isInstructor && !isAdmin) {
    res.status(403);
    throw new Error("Instructors cannot take quizzes for their own courses.");
  }
  
  if (!isInstructor && !isAdmin && !await enrolled(req.user._id, req.params.id)) {
    res.status(403);
    throw new Error("Enroll before attending quizzes.");
  }
  
  if (!isInstructor && !isAdmin) {
    let progress = await Progress.findOne({ user: req.user._id, course: req.params.id });
    let existingCertificate = await Certificate.findOne({ user: req.user._id, course: req.params.id });
    if (!existingCertificate && (!progress || course.lessons.length > 0 && !course.lessons.every((_, idx) => progress.watchedLessons.includes(idx)))) {
      res.status(403);
      throw new Error("Watch all lessons before attempting the quiz.");
    }
  }
  
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  let score = 0;
  course.quiz.forEach((question, index) => {
    if (Number(answers[index]) === Number(question.answer)) score += 1;
  });
  const quizAttempt = await QuizAttempt.create({ user: req.user._id, course: course._id, score, total: course.quiz.length, answers });
  
  // Get best score from all quiz attempts
  const allAttempts = await QuizAttempt.find({ user: req.user._id, course: course._id });
  const bestAttempt = allAttempts.reduce((best, attempt) => {
    return (attempt.score / attempt.total) > (best.score / best.total) ? attempt : best;
  }, quizAttempt);
  
  const bestPercentage = (bestAttempt.score / bestAttempt.total) * 100;
  if (bestPercentage > 80) {
    try {
      const userFullName = `${req.user.firstName || "User"} ${req.user.lastName || ""}`;
      const instructorName = course.instructor 
        ? `${course.instructor.firstName || ""} ${course.instructor.lastName || course.instructor.username || ""}`.trim()
        : "";
      
      // Check if we already have a certificate with a better or equal score
      let existingCertificate = await Certificate.findOne({ user: req.user._id, course: req.params.id });
      let shouldGenerateNew = true;
      if (existingCertificate) {
        const existingPercentage = (existingCertificate.score / existingCertificate.total) * 100;
        shouldGenerateNew = bestPercentage > existingPercentage;
      }
      
      if (shouldGenerateNew) {
        const certificateId = existingCertificate?.certificateId || `CERT-PRL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
        const certificateBuffer = await generateCertificateJpeg(userFullName, course.title, instructorName, bestAttempt.score, bestAttempt.total, new Date(), certificateId);
        
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "ProLearn/certificates",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(certificateBuffer);
        });
        
        await Certificate.findOneAndUpdate(
          { user: req.user._id, course: course._id },
          { 
            quizAttempt: bestAttempt._id, 
            score: bestAttempt.score, 
            total: bestAttempt.total, 
            certificateImageUrl: uploadResult.secure_url,
            certificateId
          },
          { upsert: true, new: true }
        );
        
        // Update leaderboard since user earned a certificate
        await updateLeaderboardForUser(req.user._id);
      }
    } catch (err) {
      console.error("Error generating certificate:", err);
    }
  }
  
  res.json({ score, total: course.quiz.length });
}));

router.get("/courses/:id/certificate", protect, asyncHandler(async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const isInstructor = String(course?.instructor) === String(req.user._id);
    const isAdmin = req.user.role === "admin";
    
    if (!isInstructor && !isAdmin && !await enrolled(req.user._id, req.params.id)) {
      res.status(403);
      throw new Error("Enroll before accessing certificate.");
    }
    
    const certificate = await Certificate.findOne({ user: req.user._id, course: req.params.id });
    if (!certificate) {
      res.status(404);
      throw new Error("Certificate not found. You need to pass the quiz first (score > 80%).");
    }
    
    const userName = `${req.user.firstName || "User"} ${req.user.lastName || ""}`;
    const courseTitle = course?.title || "ProLearn Course";
    
    res.json({ 
      certificate: {
        id: certificate._id,
        userName,
        courseTitle,
        score: certificate.score,
        total: certificate.total,
        issuedAt: certificate.createdAt,
        certificateImageUrl: certificate.certificateImageUrl,
        certificateId: certificate.certificateId,
      },
    });
  } catch (err) {
    console.error("Certificate endpoint error:", err);
    res.status(err.statusCode || 500);
    throw err;
  }
}));

router.post("/courses/:id/payments/create", protect, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("instructor");
  if (!course) {
    res.status(404);
    throw new Error("Course not found.");
  }
  if (!course.isPaid) {
    res.status(400);
    throw new Error("This course is free.");
  }

  const commissionRate = Number(process.env.COMMISSION_RATE || 0.05);
  const adminAmount = Number((course.price * commissionRate).toFixed(2));
  const instructorAmount = Number((course.price - adminAmount).toFixed(2));
  const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
  let providerOrderId = orderId;
  let razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const receiptShort = `rcpt_${Date.now().toString().slice(-8)}${crypto.randomBytes(4).toString("hex")}`;
    const payload = {
      amount: Math.round(course.price * 100),
      currency: "INR",
      receipt: receiptShort,
      notes: { courseId: String(course._id), userId: String(req.user._id) },
    };

    if (course.instructor?.payoutDetails?.startsWith("acc_")) {
      payload.transfers = [
        {
          account: course.instructor.payoutDetails,
          amount: Math.round(instructorAmount * 100),
          currency: "INR",
          notes: { instructor: String(course.instructor._id) },
          on_hold: false
        }
      ];
    }
    
    const order = await razorpay.orders.create(payload);
    providerOrderId = order.id;
  }
  let upi = process.env.INSTRUCTOR_UPI || "sampleinstructor@upi";
  if (course.instructor && ["upi", "mobile"].includes(course.instructor.payoutMethod) && course.instructor.payoutDetails) {
    upi = course.instructor.payoutDetails;
  } else if (course.instructor && course.instructor.payoutMethod === "bank") {
    // Note: A true bank transfer QR might differ, but we fallback to a mock UPI or the admin default
    // We will just append the bank details to the note instead of encoding in UPI ID directly.
    upi = process.env.INSTRUCTOR_UPI || "banktransfer@upi";
  }
  
  const qrPayload = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(course.instructor ? course.instructor.firstName + " " + course.instructor.lastName : "ProLearn Instructor")}&am=${encodeURIComponent(String(course.price))}&cu=INR&tn=${encodeURIComponent(course.title)}`;
  const qrCode = await QRCode.toDataURL(qrPayload);

  const payment = await Payment.create({
    user: req.user._id,
    course: course._id,
    amount: course.price,
    adminAmount,
    instructorAmount,
    providerOrderId,
  });

  res.json({
    payment_id: payment._id,
    order_id: providerOrderId,
    razorpay_key_id: razorpayKeyId,
    amount: course.price,
    currency: "INR",
    qr_payload: qrPayload,
    qr_code: qrCode,
    note: process.env.RAZORPAY_KEY_ID ? "Use Razorpay Checkout with this order id." : `Razorpay keys missing. Mock order. Instructor uses: ${course.instructor?.payoutMethod || "default"}`,
  });
}));

router.post("/payments/:id/verify", protect, asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ _id: req.params.id, user: req.user._id });
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found.");
  }
  if (process.env.RAZORPAY_KEY_SECRET && req.body.razorpay_signature) {
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${req.body.razorpay_order_id}|${req.body.provider_payment_id}`)
      .digest("hex");
    if (expected !== req.body.razorpay_signature) {
      res.status(400);
      throw new Error("Razorpay signature verification failed.");
    }
  }
  payment.status = "paid";
  payment.providerPaymentId = req.body.provider_payment_id || `pay_mock_${crypto.randomBytes(8).toString("hex")}`;
  await payment.save();
  res.json({ message: "Payment verified.", payment_id: payment._id });
}));

export default router;
