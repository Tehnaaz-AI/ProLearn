const InstructorApplication = require("../models/InstructorApplication");

exports.applyForInstructor = async (req, res) => {
  try {
    const { bio, experience, sampleContent } = req.body;

    if (!bio || !experience || !sampleContent) {
      return res.status(400).json({
        message: "bio, experience and sampleContent are required"
      });
    }

    const existingPending = await InstructorApplication.findOne({
      user: req.user.id,
      status: "pending"
    });

    if (existingPending) {
      return res.status(400).json({ message: "Application already pending" });
    }

    const application = await InstructorApplication.create({
      user: req.user.id,
      bio,
      experience,
      sampleContent
    });

    res.status(201).json({
      message: "Instructor application submitted",
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
