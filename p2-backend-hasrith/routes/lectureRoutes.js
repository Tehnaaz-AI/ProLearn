const express = require("express");
const router = express.Router();
const {
  createLecture,
  getLecturesBySection,
  getLectureById,
  updateLecture,
  deleteLecture,
} = require("../controllers/lectureController");

const { protect, instructorOnly } = require("../middleware/authMiddleware");

// Optional auth middleware — attaches user if token present, doesn't block if not
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    const jwt = require("jsonwebtoken");
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
};

router.get("/section/:sectionId", optionalAuth, getLecturesBySection);  // Public + optional auth
router.get("/:id", optionalAuth, getLectureById);                       // Preview=public, Full=enrolled
router.post("/", protect, instructorOnly, createLecture);               // Instructor
router.put("/:id", protect, instructorOnly, updateLecture);             // Instructor
router.delete("/:id", protect, instructorOnly, deleteLecture);          // Instructor

module.exports = router;