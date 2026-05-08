const jwt = require("jsonwebtoken");

// Verify token - protect routes
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Allow only instructors
const instructorOnly = (req, res, next) => {
  if (req.user.role !== "instructor" && req.user.role !== "admin")
    return res.status(403).json({ message: "Instructor access only" });
  next();
};

// Allow only students
const studentOnly = (req, res, next) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Student access only" });
  next();
};

module.exports = { protect, instructorOnly, studentOnly };