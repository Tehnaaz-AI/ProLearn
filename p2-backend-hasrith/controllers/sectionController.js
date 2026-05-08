const Section = require("../models/Section");
const Course = require("../models/Course");

// @desc Add section to a course
// @route POST /api/sections
// @access Instructor only
const createSection = async (req, res) => {
  try {
    const { title, courseId, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const section = await Section.create({ title, course: courseId, order });
    res.status(201).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all sections of a course
// @route GET /api/sections/course/:courseId
// @access Public
const getSectionsByCourse = async (req, res) => {
  try {
    const sections = await Section.find({ course: req.params.courseId }).sort("order");
    res.status(200).json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a section
// @route PUT /api/sections/:id
// @access Instructor only
const updateSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate("course");
    if (!section) return res.status(404).json({ message: "Section not found" });

    if (section.course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const updated = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, section: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a section
// @route DELETE /api/sections/:id
// @access Instructor only
const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate("course");
    if (!section) return res.status(404).json({ message: "Section not found" });

    if (section.course.instructor.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await section.deleteOne();
    res.status(200).json({ success: true, message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSection, getSectionsByCourse, updateSection, deleteSection };