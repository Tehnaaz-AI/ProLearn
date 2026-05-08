const express = require("express");
const router = express.Router();
const {
  createSection,
  getSectionsByCourse,
  updateSection,
  deleteSection,
} = require("../controllers/sectionController");

const { protect, instructorOnly } = require("../middleware/authMiddleware");

router.get("/course/:courseId", getSectionsByCourse);                   // Public
router.post("/", protect, instructorOnly, createSection);               // Instructor
router.put("/:id", protect, instructorOnly, updateSection);             // Instructor
router.delete("/:id", protect, instructorOnly, deleteSection);          // Instructor

module.exports = router;