const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("role roles isBlocked");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      roles: user.roles
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Only instructor
exports.isInstructor = (req, res, next) => {
  if (req.user.role !== "instructor" && !req.user.roles?.includes("instructor")) {
    return res.status(403).json({ message: "Only instructors allowed" });
  }
  next();
};
