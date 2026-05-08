const Course = require("../models/Course");

// @desc Create a new course
// @route POST /api/courses
// @access Instructor only
const createCourse = async (req, res) => {
  try {
    const { title, description, price, isFree, thumbnail, category, tags } = req.body;

    const course = await Course.create({
      title,
      description,
      instructor: req.user.id,
      price: isFree ? 0 : price,
      isFree,
      thumbnail,
      category,
      tags,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all published courses (browse)
// @route GET /api/courses
// @access Public
const getAllCourses = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const courses = await Course.find(filter)
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single course details
// @route GET /api/courses/:id
// @access Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email");

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a course
// @route PUT /api/courses/:id
// @access Instructor (owner only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Only the instructor who created it can update
    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a course
// @route DELETE /api/courses/:id
// @access Instructor (owner) or Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isOwner = course.instructor.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Not authorized" });

    await course.deleteOne();
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Publish or unpublish a course
// @route PATCH /api/courses/:id/publish
// @access Instructor (owner only)
const togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    course.isPublished = !course.isPublished;
    await course.save();

    res.status(200).json({
      success: true,
      message: `Course ${course.isPublished ? "published" : "unpublished"}`,
      isPublished: course.isPublished,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all courses by logged-in instructor
// @route GET /api/courses/my-courses
// @access Instructor only
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  togglePublish,
  getMyCourses,
};