exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin" && !req.user.roles?.includes("admin")) {
    return res.status(403).json({ message: "Only admin allowed" });
  }
  next();
};
