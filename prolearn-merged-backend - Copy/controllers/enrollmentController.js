const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// @desc Enroll in a course
// @route POST /api/enrollments
// @access Student only
// For paid courses: paymentId must be passed (set by Person 3 after payment)
const enrollCourse = async (req, res) => {
  try {
    const { courseId, paymentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.isPublished) return res.status(400).json({ message: "Course not available" });

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (alreadyEnrolled) return res.status(400).json({ message: "Already enrolled" });

    // Paid course must have paymentId
    if (!course.isFree && !paymentId) {
      return res.status(400).json({ message: "Payment required for this course" });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      paymentId: paymentId || null,
    });

    // Initialize Progress document so it shows in dashboard immediately
    const Progress = require("../models/Progress");
    await Progress.findOneAndUpdate(
      { user: req.user.id, course: courseId },
      { user: req.user.id, course: courseId },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Check if student is enrolled in a course
// @route GET /api/enrollments/check/:courseId
// @access Student only
const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    res.status(200).json({ success: true, isEnrolled: !!enrollment, enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all courses a student is enrolled in
// @route GET /api/enrollments/my-enrollments
// @access Student only
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "title thumbnail instructor isFree price")
      .sort({ enrolledAt: -1 });

    res.status(200).json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all enrollments for a course (instructor view)
// @route GET /api/enrollments/course/:courseId
// @access Instructor only
const getEnrollmentsByCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate("student", "name email")
      .sort({ enrolledAt: -1 });

    res.status(200).json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  enrollCourse,
  checkEnrollment,
  getMyEnrollments,
  getEnrollmentsByCourse,
};