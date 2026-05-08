const express = require("express");
const router = express.Router();

const {
  approveCourse,
  rejectCourse,
  getAllUsers,
  approveInstructor,
  blockUser,
  removeRole
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminmiddleware");

// approve/reject courses
router.put("/course/:courseId/approve", protect, isAdmin, approveCourse);
router.put("/course/:courseId/reject", protect, isAdmin, rejectCourse);

// get all users
router.get("/users", protect, isAdmin, getAllUsers);

// instructor/user controls
router.put("/approve", protect, isAdmin, approveInstructor);
router.put("/block-user", protect, isAdmin, blockUser);
router.put("/remove-role", protect, isAdmin, removeRole);

module.exports = router;
