
import express from "express";
import { protect, allow } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import Leaderboard from "../models/Leaderboard.js";
import ForumPost from "../models/ForumPost.js";
import StudyGroup from "../models/StudyGroup.js";
import StudyGroupMessage from "../models/StudyGroupMessage.js";
import Bookmark from "../models/Bookmark.js";
import Note from "../models/Note.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Progress from "../models/Progress.js";
import User from "../models/User.js";
import Certificate from "../models/Certificate.js";
import Notification from "../models/Notification.js";

async function sendNotification(data) {
  const notification = new Notification(data);
  await notification.save();
  return notification;
}

const router = express.Router();

// Notification routes
router.get("/notifications", protect, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json({ notifications });
}));

router.put("/notifications/:id/read", protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }
  if (String(notification.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized.");
  }
  notification.read = true;
  await notification.save();
  res.json({ notification });
}));

async function enrolled(userId, courseId) {
  return Boolean(await Enrollment.findOne({ user: userId, course: courseId }));
}

async function canModifyForumPost(req, post) {
  if (req.user.role === "admin") return true;
  return String(post.user) === String(req.user._id);
}

async function canModifyStudyGroup(req, group) {
  if (req.user.role === "admin") return true;
  return String(group.createdBy) === String(req.user._id);
}

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

async function calculateInstructorXP(userId) {
  // XP for instructors: base for each published course + bonus per enrollment
  const courses = await Course.find({ instructor: userId, status: "published" });
  let totalXP = 0;
  for (const course of courses) {
    // base XP per published course
    totalXP += 500;
    // bonus per enrolled student
    const enrollCount = await Enrollment.countDocuments({ course: course._id });
    totalXP += enrollCount * 100;
  }
  return totalXP;
}

// Helper to extract user from request (for optional auth)
async function getOptionalUser(req) {
  try {
    if (!req.headers.authorization) return null;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return null;
    const { verifyToken } = await import("../utils/token.js");
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    return null;
  }
}

// Leaderboard routes
router.get("/leaderboard", asyncHandler(async (req, res) => {
  const courseId = req.query.courseId;
  const type = String(req.query.type || "both").toLowerCase(); // 'students', 'instructors', 'both'
  const currentUser = await getOptionalUser(req);
  let currentUserEntry = null;

  // Helper to assign dense ranks based on xp, completedLessons and level
  function assignRanks(list) {
    let rank = 0;
    let prev = null;
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const key = `${item.xp}`;
      if (key !== prev) {
        rank = i + 1;
        prev = key;
      }
      item.rank = rank;
    }
  }

  // Build student leaderboard
  async function buildStudentLeaderboard(filterCourseId) {
    // If courseId passed, restrict to enrolled students for that course
    let studentUsers;
    if (filterCourseId) {
      const enrolls = await Enrollment.find({ course: filterCourseId }).select("user");
      const ids = enrolls.map(e => e.user);
      studentUsers = await User.find({ _id: { $in: ids }, role: "student" }, "username firstName lastName profilePictureUrl");
    } else {
      studentUsers = await User.find({ role: "student" }, "username firstName lastName profilePictureUrl");
    }

    const list = [];
    for (const user of studentUsers) {
      const xp = await calculateUserTotalXP(user._id);
      const userProgress = await Progress.find({ user: user._id });
      const totalCompletedLessons = userProgress.reduce((sum, p) => sum + p.watchedLessons.length, 0);
      const level = Math.floor(xp / 500) + 1;
      list.push({ _id: user._id, user, xp, level, completedLessons: totalCompletedLessons });
    }

    // sort and assign ranks (only by xp)
    list.sort((a, b) => b.xp - a.xp);
    assignRanks(list);
    return list;
  }

  // Build instructor leaderboard
  async function buildInstructorLeaderboard() {
    const instructors = await User.find({ role: "instructor" }, "username firstName lastName profilePictureUrl");
    const list = [];
    for (const ins of instructors) {
      const xp = await calculateInstructorXP(ins._id);
      // total enrollments across their courses for tie-breaker
      const courses = await Course.find({ instructor: ins._id, status: "published" }).select("_id");
      let enrollments = 0;
      for (const c of courses) enrollments += await Enrollment.countDocuments({ course: c._id });
      list.push({ _id: ins._id, user: ins, xp, totalEnrollments: enrollments });
    }
    // sort and assign ranks (only by xp)
    list.sort((a, b) => b.xp - a.xp);
    let rank = 0;
    let prev = null;
    for (let i = 0; i < list.length; i++) {
      const key = `${list[i].xp}`;
      if (key !== prev) { rank = i + 1; prev = key; }
      list[i].rank = rank;
    }
    return list;
  }

  // decide which leaderboards to return
  const result = {};
  if (type === "students" || type === "both") {
    const students = await buildStudentLeaderboard(courseId);
    result.students = students;
    // set current user entry if they are student
    if (currentUser) {
      currentUserEntry = students.find(e => String(e._id) === String(currentUser._id)) || null;
      if (!currentUserEntry && currentUser.role === "student") {
        const xp = await calculateUserTotalXP(currentUser._id);
        const userProgress = await Progress.find({ user: currentUser._id });
        const totalCompletedLessons = userProgress.reduce((sum, p) => sum + p.watchedLessons.length, 0);
        const level = Math.floor(xp / 500) + 1;
        currentUserEntry = { _id: currentUser._id, user: currentUser, xp, level, completedLessons: totalCompletedLessons, rank: null };
      }
    }
  }

  if (type === "instructors" || type === "both") {
    const instructors = await buildInstructorLeaderboard();
    result.instructors = instructors;
    if (currentUser && currentUser.role === "instructor") {
      const found = instructors.find(e => String(e._id) === String(currentUser._id));
      if (found) currentUserEntry = found;
      else {
        const xp = await calculateInstructorXP(currentUser._id);
        const courses = await Course.find({ instructor: currentUser._id, status: "published" }).select("_id");
        let enrollments = 0;
        for (const c of courses) enrollments += await Enrollment.countDocuments({ course: c._id });
        currentUserEntry = { _id: currentUser._id, user: currentUser, xp, totalEnrollments: enrollments, rank: null };
      }
    }
  }

  // Build a compatibility leaderboard array and analytics
  const leaderboard = [];
  if (result.students) leaderboard.push(...result.students.map(entry => ({ ...entry, type: "student" })));
  if (result.instructors) leaderboard.push(...result.instructors.map(entry => ({ ...entry, type: "instructor" })));
  leaderboard.sort((a, b) => b.xp - a.xp);

  let globalRank = 0;
  let prevXp = null;
  for (let i = 0; i < leaderboard.length; i++) {
    const entry = leaderboard[i];
    if (entry.xp !== prevXp) {
      globalRank = i + 1;
      prevXp = entry.xp;
    }
    entry.rank = globalRank;
  }

  if (currentUserEntry && currentUserEntry.rank == null) {
    const found = leaderboard.find(e => String(e._id) === String(currentUserEntry._id));
    if (found) {
      currentUserEntry.rank = found.rank;
    }
  }

  const analytics = {};
  if (result.students) {
    analytics.topStudent = result.students[0] || null;
    analytics.totalStudentParticipants = result.students.length;
  }
  if (result.instructors) {
    analytics.topInstructor = result.instructors[0] || null;
    analytics.totalInstructorParticipants = result.instructors.length;
  }
  analytics.topPerformer = leaderboard[0] || null;
  analytics.totalParticipants = leaderboard.length;

  res.json({ ...result, leaderboard, currentUserEntry, analytics });
}));

// User Analytics and Progress route
router.get("/analytics/me", protect, asyncHandler(async (req, res) => {
  // Get all enrollments for the user
  const enrollments = await Enrollment.find({ user: req.user._id })
    .populate("course", "title lessons");

  // Get all progress entries for the user
  const progressEntries = await Progress.find({ user: req.user._id });

  // Calculate total XP using our function
  const totalXP = await calculateUserTotalXP(req.user._id);

  // Create progress map for quick lookup
  const progressMap = new Map();
  progressEntries.forEach(progress => {
    progressMap.set(String(progress.course), progress);
  });

  // Calculate totals
  let maxLevel = Math.floor(totalXP / 500) + 1;
  let totalCompletedLessons = 0;

  // Build course progress from enrollments
  const courseProgress = enrollments.map(enrollment => {
    const course = enrollment.course;
    const progress = progressMap.get(String(course._id));

    // Get completed lessons from Progress (source of truth)
    const completedLessons = progress?.watchedLessons?.length || 0;
    const totalLessons = course.lessons?.length || 0;
    const percentage = totalLessons > 0
      ? Math.min(Math.round((completedLessons / totalLessons) * 100), 100)
      : 0;

    // Calculate course-specific XP
    let courseXP = completedLessons * 50;
    if (course && course.lessons.length > 0 && completedLessons === course.lessons.length) {
      courseXP += 500;
    }
    const level = Math.floor(courseXP / 500) + 1;

    // Update totals
    totalCompletedLessons += completedLessons;

    return {
      course: {
        _id: course._id,
        title: course.title,
        totalLessons: totalLessons
      },
      xp: courseXP,
      level: level,
      completedLessons: completedLessons,
      percentage: percentage
    };
  });

  res.json({
    userAnalytics: {
      totalXP,
      maxLevel,
      totalCompletedLessons,
      enrolledCourses: enrollments.length
    },
    courseProgress
  });
}));

// Forum routes
router.get("/forums/posts", asyncHandler(async (req, res) => {
  const courseId = req.query.courseId;
  const filter = { status: "active" };
  if (courseId) filter.course = courseId;
  const posts = await ForumPost.find(filter)
    .populate("user", "username firstName lastName profilePictureUrl")
    .populate("course", "title")
    .populate("comments.user", "username firstName lastName profilePictureUrl")
    .sort({ pinned: -1, createdAt: -1 });
  res.json({ posts });
}));

router.put("/forums/posts/:postId/pin", protect, asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId).populate("course");
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }
  const isAdmin = req.user.role === "admin";
  const isInstructor = String(post.course.instructor) === String(req.user._id);
  if (!isAdmin && !isInstructor) {
    res.status(403);
    throw new Error("Only admin or course instructor can pin/unpin posts.");
  }
  post.pinned = !post.pinned;
  await post.save();
  res.json({ post });
}));

router.post("/forums/posts", protect, asyncHandler(async (req, res) => {
  if (!req.body.title || !req.body.content || !req.body.course) {
    res.status(400);
    throw new Error("Title, content, and course are required.");
  }
  if (!await enrolled(req.user._id, req.body.course)) {
    res.status(403);
    throw new Error("Enroll before posting in forums.");
  }
  const post = await ForumPost.create({
    course: req.body.course,
    user: req.user._id,
    title: req.body.title,
    content: req.body.content,
  });
  res.status(201).json({ post });
}));

router.post("/forums/posts/:postId/comments", protect, asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }
  if (!req.body.content) {
    res.status(400);
    throw new Error("Comment content is required.");
  }
  post.comments.push({
    user: req.user._id,
    content: req.body.content,
  });
  await post.save();
  res.status(201).json({ post });
}));

router.put("/forums/posts/:postId/status", protect, asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId).populate("course");
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }
  const isAdmin = req.user.role === "admin";
  const isInstructor = String(post.course.instructor) === String(req.user._id);
  if (!isAdmin && !isInstructor) {
    res.status(403);
    throw new Error("Only admin or course instructor can control this post.");
  }
  post.status = req.body.status || "active";
  await post.save();
  res.json({ post });
}));

router.put("/forums/posts/:postId/like", protect, asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }

  const userIdStr = String(req.user._id);
  const hasLiked = post.likes.some(id => String(id) === userIdStr);

  if (hasLiked) {
    post.likes = post.likes.filter(id => String(id) !== userIdStr);
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  res.json({ post });
}));

router.delete("/forums/posts/:postId", protect, asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }
  if (!await canModifyForumPost(req, post)) {
    res.status(403);
    throw new Error("You don't have permission to delete this post.");
  }

  const isOwnPost = String(post.user) === String(req.user._id);
  if (!isOwnPost && !req.body.reason) {
    res.status(400);
    throw new Error("Deletion reason is required.");
  }

  const postUserId = post.user;
  const postTitle = post.title;

  await ForumPost.findByIdAndUpdate(req.params.postId, {
    status: "deleted",
    deletionReason: req.body.reason || "Deleted by owner"
  });

  if (!isOwnPost) {
    await sendNotification({
      user: postUserId,
      type: "content_deleted",
      title: "Forum Post Deleted",
      message: `Your forum post "${postTitle}" has been deleted.`,
      reason: req.body.reason,
      contentType: "post",
      contentTitle: postTitle
    });
  }

  res.json({ message: "Post deleted." });
}));

// Study Group routes
router.get("/study-groups", asyncHandler(async (req, res) => {
  const courseId = req.query.courseId;
  const filter = courseId ? { course: courseId, status: { $ne: "deleted" } } : { status: { $ne: "deleted" } };
  const groups = await StudyGroup.find(filter)
    .populate("course", "title")
    .populate("createdBy", "username firstName lastName profilePictureUrl")
    .populate("members", "username firstName lastName profilePictureUrl")
    .sort({ pinned: -1, createdAt: -1 });
  res.json({ groups });
}));

router.put("/study-groups/:groupId/pin", protect, asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.groupId).populate("course");
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  const isAdmin = req.user.role === "admin";
  const isInstructor = String(group.course.instructor) === String(req.user._id);
  if (!isAdmin && !isInstructor) {
    res.status(403);
    throw new Error("Only admin or course instructor can pin/unpin study groups.");
  }
  group.pinned = !group.pinned;
  await group.save();
  res.json({ group });
}));

router.post("/study-groups", protect, asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.course) {
    res.status(400);
    throw new Error("Name and course are required.");
  }
  const group = await StudyGroup.create({
    course: req.body.course,
    name: req.body.name,
    description: req.body.description || "",
    createdBy: req.user._id,
    members: [req.user._id],
  });
  res.status(201).json({ group });
}));

router.post("/study-groups/:groupId/join", protect, asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.groupId);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  const isMember = group.members.some(memberId => String(memberId) === String(req.user._id));
  if (!isMember) {
    group.members.push(req.user._id);
    await group.save();
  }
  res.json({ group });
}));

router.delete("/study-groups/:groupId", protect, asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.groupId);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  if (!await canModifyStudyGroup(req, group)) {
    res.status(403);
    throw new Error("You don't have permission to delete this group.");
  }

  const isOwnGroup = String(group.createdBy) === String(req.user._id);
  if (!isOwnGroup && !req.body.reason) {
    res.status(400);
    throw new Error("Deletion reason is required.");
  }

  const groupCreatorId = group.createdBy;
  const groupName = group.name;

  await StudyGroup.findByIdAndUpdate(req.params.groupId, {
    status: "deleted",
    deletionReason: req.body.reason || "Deleted by owner"
  });

  if (!isOwnGroup) {
    await sendNotification({
      user: groupCreatorId,
      type: "content_deleted",
      title: "Study Group Deleted",
      message: `Your study group "${groupName}" has been deleted.`,
      reason: req.body.reason,
      contentType: "group",
      contentTitle: groupName
    });
  }

  res.json({ message: "Study group deleted." });
}));

router.get("/study-groups/:groupId/messages", protect, asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.groupId);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  const isMember = group.members.some(memberId => String(memberId) === String(req.user._id));
  if (!isMember) {
    group.members.push(req.user._id);
    await group.save();
  }
  const messages = await StudyGroupMessage.find({ studyGroup: req.params.groupId })
    .populate("user", "username firstName lastName profilePictureUrl")
    .sort({ createdAt: 1 });
  res.json({ messages });
}));

router.post("/study-groups/:groupId/messages", protect, asyncHandler(async (req, res) => {
  const group = await StudyGroup.findById(req.params.groupId);
  if (!group) {
    res.status(404);
    throw new Error("Study group not found.");
  }
  const isMember = group.members.some(memberId => String(memberId) === String(req.user._id));
  if (!isMember) {
    group.members.push(req.user._id);
    await group.save();
  }
  const message = await StudyGroupMessage.create({
    studyGroup: req.params.groupId,
    user: req.user._id,
    content: req.body.content || "",
    videoUrl: req.body.videoUrl || "",
  });
  res.status(201).json({ message });
}));

// Enrollments route
router.get("/enrollments", protect, asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate({ path: "course", populate: { path: "instructor", select: "username" } }).sort({ createdAt: -1 });
  res.json({ enrollments });
}));

// Bookmark routes
router.get("/bookmarks", protect, asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate("course", "title")
    .sort({ createdAt: -1 });
  res.json({ bookmarks });
}));

router.post("/bookmarks", protect, asyncHandler(async (req, res) => {
  if (!req.body.course || isNaN(req.body.lessonIndex)) {
    res.status(400);
    throw new Error("Course and lesson index are required.");
  }
  const existing = await Bookmark.findOne({
    user: req.user._id,
    course: req.body.course,
    lessonIndex: req.body.lessonIndex,
  });
  if (existing) {
    await Bookmark.findByIdAndDelete(existing._id);
    res.json({ message: "Bookmark removed." });
  } else {
    const bookmark = await Bookmark.create({
      user: req.user._id,
      course: req.body.course,
      lessonIndex: req.body.lessonIndex,
    });
    res.status(201).json({ bookmark });
  }
}));

// Note routes
router.get("/notes", protect, asyncHandler(async (req, res) => {
  const courseId = req.query.courseId;
  const filter = { user: req.user._id };
  if (courseId) filter.course = courseId;
  const notes = await Note.find(filter)
    .populate("course", "title")
    .sort({ createdAt: -1 });
  res.json({ notes });
}));

router.post("/notes", protect, asyncHandler(async (req, res) => {
  if (!req.body.course || isNaN(req.body.lessonIndex) || !req.body.content) {
    res.status(400);
    throw new Error("Course, lesson index, and content are required.");
  }
  const note = await Note.create({
    user: req.user._id,
    course: req.body.course,
    lessonIndex: req.body.lessonIndex,
    timestamp: req.body.timestamp || 0,
    content: req.body.content,
  });
  res.status(201).json({ note });
}));

router.put("/notes/:noteId", protect, asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) {
    res.status(404);
    throw new Error("Note not found.");
  }
  if (String(note.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only edit your own notes.");
  }
  note.content = req.body.content || note.content;
  note.timestamp = req.body.timestamp !== undefined ? req.body.timestamp : note.timestamp;
  await note.save();
  res.json({ note });
}));

router.delete("/notes/:noteId", protect, asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.noteId);
  if (!note) {
    res.status(404);
    throw new Error("Note not found.");
  }
  if (String(note.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error("You can only delete your own notes.");
  }
  await Note.findByIdAndDelete(req.params.noteId);
  res.json({ message: "Note deleted." });
}));

export default router;
