const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublish,
  getMyCourses,
} = require("../controllers/courseController");

const { protect, instructorOnly } = require("../middleware/authMiddleware");

router.get("/", getAllCourses);                                          // Public
router.post("/", protect, instructorOnly, createCourse);                // Instructor
router.get("/my-courses", protect, instructorOnly, getMyCourses);       // Instructor
router.get("/:id", getCourseById);                                      // Public
router.put("/:id", protect, instructorOnly, updateCourse);              // Instructor
router.patch("/:id/publish", protect, instructorOnly, togglePublish);   // Instructor
router.delete("/:id", protect, instructorOnly, deleteCourse);           // Instructor/Admin

module.exports = router;