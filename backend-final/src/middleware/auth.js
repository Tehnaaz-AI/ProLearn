import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Login required.");
  }

  const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || "change-this-secret");
  const user = await User.findById(decoded.id).select("+passwordHash");
  if (!user || user.status !== "active") {
    res.status(401);
    throw new Error("Account not found or blocked.");
  }

  req.user = user;
  next();
});

export function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error("You are not allowed to perform this action.");
    }
    next();
  };
}
