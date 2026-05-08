const Lecture = require("../models/Lecture");
const Section = require("../models/Section");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// @desc Add lecture to a section
// @route POST /api/lectures
// @access Instructor only
const createLecture = async (req, res) => {
  try {
    const { title, sectionId, courseId, videoUrl, duration, isPreview, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const lecture = await Lecture.create({
      title,
      section: sectionId,
      course: courseId,
      videoUrl,
      duration,
      isPreview,
      order,
    });

    res.status(201).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all lectures of a section
// @route GET /api/lectures/section/:sectionId
// @access Public (but videoUrl hidden for non-enrolled, non-preview)
const getLecturesBySection = async (req, res) => {
  try {
    const lectures = await Lecture.find({ section: req.params.sectionId }).sort("order");

    // Check if user is enrolled (token optional here)
    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: lectures[0]?.course,
      });
      isEnrolled = !!enrollment;
    }

    // Hide videoUrl if not enrolled and not preview
    const sanitized = lectures.map((lec) => {
      const obj = lec.toObject();
      if (!isEnrolled && !lec.isPreview) {
        delete obj.videoUrl;
      }
      return obj;
    });

    res.status(200).json({ success: true, lectures: sanitized });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single lecture (with access control)
// @route GET /api/lectures/:id
// @access Preview = public | Full = enrolled only
const getLectureById = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    // If it's a preview lecture, allow anyone
    if (lecture.isPreview) {
      return res.status(200).json({ success: true, lecture });
    }

    // Otherwise check enrollment
    if (!req.user) {
      return res.status(401).json({ message: "Login required to access this lecture" });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: lecture.course,
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Enroll in the course to access this lecture" });
    }

    res.status(200).json({ success: true, lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a lecture
// @route PUT /api/lectures/:id
// @access Instructor only
const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate({
      path: "course",
      select: "instructor",
    });

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    if (lecture.course.instructor.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, lecture: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a lecture
// @route DELETE /api/lectures/:id
// @access Instructor only
const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate({
      path: "course",
      select: "instructor",
    });

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    if (lecture.course.instructor.toString() !== req.user.id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await lecture.deleteOne();
    res.status(200).json({ success: true, message: "Lecture deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLecture,
  getLecturesBySection,
  getLectureById,
  updateLecture,
  deleteLecture,
};