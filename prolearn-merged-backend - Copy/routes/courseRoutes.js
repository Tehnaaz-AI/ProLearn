const express = require("express");
const router = express.Router();

const {
  createCourse,
  addLecture,
  enrollCourse,
  getCourseContent,
  getCourseDetails,
  getCourses,
  updateCourseProgress,
  updateCourse,
  deleteCourse,
  togglePublish,
  getMyCourses
} = require("../controllers/courseController");

const {
  protect,
  isInstructor
} = require("../middleware/authMiddleware");
const { videoUpload } = require("../middleware/uploadmiddleware");

router.get("/", getCourses);
router.get("/my-courses", protect, isInstructor, getMyCourses);
router.get("/:courseId", getCourseDetails);

// only instructor can create course
router.post("/", protect, isInstructor, createCourse);
router.put("/:courseId", protect, isInstructor, updateCourse);
router.delete("/:courseId", protect, isInstructor, deleteCourse);
router.patch("/:courseId/publish", protect, isInstructor, togglePublish);

// only instructor can add lecture
router.post("/:courseId/lecture", protect, isInstructor, videoUpload.single("video"), addLecture);

// enrolled students can access videos and save progress
router.post("/:courseId/enroll", protect, enrollCourse);
router.get("/:courseId/content", protect, getCourseContent);
router.patch("/:courseId/progress", protect, updateCourseProgress);

module.exports = router;
