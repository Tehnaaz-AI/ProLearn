const Course = require("../models/Course");
const User = require("../models/User");
const InstructorApplication = require("../models/InstructorApplication");

// approve course
exports.approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "approved" },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

// reject course
exports.rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByIdAndUpdate(
      courseId,
      { status: "rejected" },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// approve/reject instructor application
exports.approveInstructor = async (req, res) => {
  try {
    const { applicationId, status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be approved or rejected" });
    }

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    application.rejectionReason = status === "rejected" ? rejectionReason : undefined;
    await application.save();

    if (status === "approved") {
      const user = await User.findById(application.user);

      if (user && !user.roles.includes("instructor")) {
        user.roles.push("instructor");
        user.role = "instructor";
        await user.save();
      }
    }

    res.json({ message: `Instructor application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId, isBlocked = true } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: isBlocked ? "User blocked" : "User unblocked", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (role === "student") {
      return res.status(400).json({ message: "student role cannot be removed" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.roles = user.roles.filter((userRole) => userRole !== role);
    user.role = user.roles.includes("instructor") ? "instructor" : "student";
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ message: "Role removed", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
