const express = require("express");
const router = express.Router();

const { applyForInstructor } = require("../controllers/instructorController");
const { protect } = require("../middleware/authMiddleware");

router.post("/apply", protect, applyForInstructor);

module.exports = router;
