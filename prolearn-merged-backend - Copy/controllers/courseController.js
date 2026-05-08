const { Types } = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const {
  cloudinary,
  isCloudinaryConfigured
} = require("../config/cloudinary");

const uploadVideoToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(new Error("Cloudinary credentials are not configured"));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "prolearn/course-videos"
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });

const isAdmin = (user) => user.roles?.includes("admin") || user.role === "admin";

const isInstructorOwner = (course, user) =>
  course.instructor && course.instructor.toString() === user.id.toString();

const isApprovedEnrollment = (course, userId) =>
  course.studentsEnrolled.some((enrollment) => {
    const enrolledUserId = enrollment.user || enrollment;
    return (
      enrolledUserId &&
      enrolledUserId.toString() === userId.toString() &&
      (!enrollment.status || enrollment.status === "approved")
    );
  });

const publicCourseSelect = "title description price thumbnail status instructor createdAt";

exports.getCourses = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const courses = await Course.find(filter)
      .select(publicCourseSelect)
      .populate("instructor", "name avatar")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      // .select(publicCourseSelect)
      // .populate("instructor", "name avatar");
     //console.log(course)
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.isPublished !== true) {
      return res.status(403).json({ message: "Course is not published yet" });
    }

    res.json(course);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, isFree, thumbnail, category, tags, sections = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const course = await Course.create({
      title,
      description,
      price: isFree ? 0 : price,
      isFree: isFree || false,
      thumbnail,
      category,
      tags,
      sections,
      instructor: req.user.id
    });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { createdCourses: course._id }
    });

    res.status(201).json({ success: true, message: "Course created successfully", course });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

// Add lecture video to a course. Accepts either multipart field "video" or an existing Cloudinary URL in body.videoUrl.
exports.addLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { sectionTitle, lectureTitle, videoUrl, duration } = req.body;

    if (!sectionTitle || !lectureTitle) {
      return res.status(400).json({
        message: "sectionTitle and lectureTitle are required"
      });
    }

    if (!req.file && !videoUrl) {
      return res.status(400).json({
        message: "Upload a video file or provide videoUrl"
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!isInstructorOwner(course, req.user) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "You can only add lectures to your own course" });
    }

    let lectureVideo = {
      videoUrl,
      cloudinaryPublicId: req.body.cloudinaryPublicId,
      cloudinaryResourceType: req.body.cloudinaryResourceType || "video",
      duration
    };

    if (req.file) {
      const uploadResult = await uploadVideoToCloudinary(req.file);
      lectureVideo = {
        videoUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        cloudinaryResourceType: uploadResult.resource_type,
        duration: uploadResult.duration
      };
    }

    let section = course.sections.find((sec) => sec.title === sectionTitle);

    if (!section) {
      course.sections.push({ title: sectionTitle, lectures: [] });
      section = course.sections[course.sections.length - 1];
    }

    section.lectures.push({
      title: lectureTitle,
      ...lectureVideo
    });

    await course.save();

    res.json({ message: "Lecture added successfully", course });
  } catch (error) {
    if (error.message === "Cloudinary credentials are not configured") {
      return res.status(503).json({ message: error.message });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const [course, user] = await Promise.all([
      Course.findById(courseId),
      User.findById(req.user.id)
    ]);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (course.isPublished !== true) {
      return res.status(403).json({ message: "Only published courses can be enrolled" });
    }

    const courseEnrollment = course.studentsEnrolled.find((enrollment) => {
      const enrolledUserId = enrollment.user || enrollment;
      return enrolledUserId && enrolledUserId.toString() === req.user.id.toString();
    });

    const userEnrollment = user.enrolledCourses.find((enrollment) => {
      const enrolledCourseId = enrollment.course || enrollment;
      return enrolledCourseId && enrolledCourseId.toString() === courseId;
    });

    const alreadyEnrolled =
      courseEnrollment?.status === "approved" && Boolean(userEnrollment);

    if (!courseEnrollment) {
      course.studentsEnrolled.push({
        user: req.user.id,
        status: "approved",
        progressPercent: 0
      });
    } else {
      courseEnrollment.status = "approved";
    }

    if (!userEnrollment) {
      user.enrolledCourses.push({
        course: courseId,
        progressPercent: 0,
        completedLectures: []
      });
      
      // Also create Enrollment document for cross-compatibility
      await Enrollment.create({
        student: req.user.id,
        course: courseId,
        paymentId: null // Free course enrollment
      });

      // Initialize Progress document so it shows in dashboard immediately
      const Progress = require("../models/Progress");
      await Progress.findOneAndUpdate(
        { user: req.user.id, course: courseId },
        { user: req.user.id, course: courseId },
        { upsert: true, new: true }
      );
    }

    await Promise.all([course.save(), user.save()]);

    res.status(alreadyEnrolled ? 200 : 201).json({
      message: alreadyEnrolled ? "Already enrolled" : "Enrolled successfully"
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.getCourseContent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructor", "name avatar")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const canAccess =
      isAdmin(req.user) ||
      course.instructor?._id?.toString() === req.user.id.toString() ||
      (course.isPublished === true && isApprovedEnrollment(course, req.user.id));

    if (!canAccess) {
      return res.status(403).json({ message: "Enroll in this course to access videos" });
    }

    res.json(course);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.updateCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lectureId, progressPercent } = req.body;
    const course = await Course.findById(courseId);
    const user = await User.findById(req.user.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courseEnrollment = course.studentsEnrolled.find((enrollment) => {
      const enrolledUserId = enrollment.user || enrollment;
      return enrolledUserId && enrolledUserId.toString() === req.user.id.toString();
    });

    const userEnrollment = user.enrolledCourses.find((enrollment) => {
      const enrolledCourseId = enrollment.course || enrollment;
      return enrolledCourseId && enrolledCourseId.toString() === courseId;
    });

    if (!courseEnrollment || courseEnrollment.status !== "approved" || !userEnrollment) {
      return res.status(403).json({ message: "Only enrolled users can update progress" });
    }

    let nextProgress = progressPercent;

    if (lectureId) {
      if (!Types.ObjectId.isValid(lectureId)) {
        return res.status(400).json({ message: "Invalid lectureId" });
      }

      const lectureExists = course.sections.some((section) =>
        section.lectures.some((lecture) => lecture._id.toString() === lectureId)
      );

      if (!lectureExists) {
        return res.status(404).json({ message: "Lecture not found in this course" });
      }

      const alreadyCompleted = userEnrollment.completedLectures.some(
        (completedLectureId) => completedLectureId.toString() === lectureId
      );

      if (!alreadyCompleted) {
        userEnrollment.completedLectures.push(lectureId);
      }

      const totalLectures = course.sections.reduce(
        (total, section) => total + section.lectures.length,
        0
      );

      if (totalLectures > 0) {
        nextProgress = Math.round(
          (userEnrollment.completedLectures.length / totalLectures) * 100
        );
      }
    }

    if (nextProgress === undefined) {
      return res.status(400).json({ message: "lectureId or progressPercent is required" });
    }

    if (nextProgress < 0 || nextProgress > 100) {
      return res.status(400).json({ message: "progressPercent must be between 0 and 100" });
    }

    userEnrollment.progressPercent = nextProgress;
    courseEnrollment.progressPercent = nextProgress;

    await Promise.all([user.save(), course.save()]);

    res.json({
      message: "Progress updated",
      progressPercent: nextProgress,
      completedLectures: userEnrollment.completedLectures
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    res.status(500).json({ message: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!isInstructorOwner(course, req.user) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Course.findByIdAndUpdate(req.params.courseId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, course: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!isInstructorOwner(course, req.user) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.deleteOne();
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle publish
exports.togglePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!isInstructorOwner(course, req.user) && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized" });
    }

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

// Get My Courses (Instructor)
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
