const express = require("express");
const router = express.Router();
const {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const { protect, isInstructor } = require("../middleware/authMiddleware");

router.get("/course/:courseId", getSectionsByCourse);                   // Public
router.post("/", protect, isInstructor, createSection);               // Instructor
router.put("/:id", protect, isInstructor, updateSection);             // Instructor
router.delete("/:id", protect, isInstructor, deleteSection);          // Instructor

module.exports = router;