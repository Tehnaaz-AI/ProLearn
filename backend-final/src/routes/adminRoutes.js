import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import { protect, allow } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { courseDto, publicUser } from "../utils/formatters.js";

const router = express.Router();

router.use(protect, allow("admin"));

router.get("/users", asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
}));

router.get("/users/:id", asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }
  res.json({ user: publicUser(user) });
}));

router.post("/users/:id/block", asyncHandler(async (req, res) => {
  if (!req.body.reason) {
    res.status(400);
    throw new Error("Valid block reason is required.");
  }
  if (String(req.params.id) === String(req.user._id)) {
    res.status(403);
    throw new Error("The active admin account cannot block itself.");
  }
  await User.findByIdAndUpdate(req.params.id, { status: "blocked", blockReason: req.body.reason });

  const notification = new Notification({
    user: req.params.id,
    type: "user_blocked",
    title: "Account Blocked",
    message: "Your account has been blocked.",
    reason: req.body.reason
  });
  await notification.save();

  res.json({ message: "User blocked." });
}));

router.delete("/users/:id", asyncHandler(async (req, res) => {
  if (!req.body.reason) {
    res.status(400);
    throw new Error("Deletion reason is required.");
  }
  if (String(req.params.id) === String(req.user._id)) {
    res.status(403);
    throw new Error("The active admin account cannot delete itself.");
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const notification = new Notification({
    user: req.params.id,
    type: "user_deleted",
    title: "Account Deleted",
    message: "Your account has been deleted.",
    reason: req.body.reason
  });
  await notification.save();

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted." });
}));

router.post("/users/:id/unblock", asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    res.status(403);
    throw new Error("The active admin account cannot unblock itself here. Use profile for own details.");
  }
  await User.findByIdAndUpdate(req.params.id, { status: "active", blockReason: null });
  res.json({ message: "User unblocked." });
}));

router.get("/revenue-stats", asyncHandler(async (req, res) => {
  const payments = await Payment.find({ status: "paid" }).sort({ createdAt: -1 });

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalAdminRevenue = payments.reduce((sum, p) => sum + p.adminAmount, 0);
  const totalInstructorRevenue = payments.reduce((sum, p) => sum + p.instructorAmount, 0);

  const monthlyStats = {};
  payments.forEach(payment => {
    const date = new Date(payment.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyStats[key]) {
      monthlyStats[key] = {
        month: key,
        totalRevenue: 0,
        adminRevenue: 0,
        instructorRevenue: 0,
        paymentCount: 0
      };
    }
    monthlyStats[key].totalRevenue += payment.amount;
    monthlyStats[key].adminRevenue += payment.adminAmount;
    monthlyStats[key].instructorRevenue += payment.instructorAmount;
    monthlyStats[key].paymentCount += 1;
  });

  const monthlyStatsArray = Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month));

  res.json({
    totalRevenue,
    totalAdminRevenue,
    totalInstructorRevenue,
    totalPayments: payments.length,
    monthlyStats: monthlyStatsArray
  });
}));

router.get("/payments", asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate("user", "username")
    .populate({ path: "course", select: "title instructor", populate: { path: "instructor", select: "username" } })
    .sort({ createdAt: -1 });

  res.json({
    commission_rate: Number(process.env.COMMISSION_RATE || 0.05),
    payments: payments.map((payment) => ({
      id: payment._id,
      title: payment.course?.title,
      student: payment.user?.username,
      instructor: payment.course?.instructor?.username,
      amount: payment.amount,
      admin_amount: payment.adminAmount,
      instructor_amount: payment.instructorAmount,
      status: payment.status,
      provider_order_id: payment.providerOrderId,
      provider_payment_id: payment.providerPaymentId,
      created_at: payment.createdAt,
    })),
  });
}));

router.get("/courses", asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("instructor", "username").sort({ createdAt: -1 });
  res.json({ courses: courses.map((course) => courseDto(course)) });
}));

export default router;
