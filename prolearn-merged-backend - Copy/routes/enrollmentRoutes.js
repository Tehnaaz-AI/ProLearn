const express = require("express");
const router = express.Router();
const {
  enrollCourse,
  checkEnrollment,
  getMyEnrollments,
  getEnrollmentsByCourse,
} = require("../controllers/enrollmentController");

const { protect, isInstructor } = require("../middleware/authMiddleware");

router.post("/", protect, enrollCourse);                                        // Student
router.get("/my-enrollments", protect, getMyEnrollments);                       // Student
router.get("/check/:courseId", protect, checkEnrollment);                       // Student
router.get("/course/:courseId", protect, isInstructor, getEnrollmentsByCourse); // Instructor

module.exports = router;