import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "change-this-secret", {
    expiresIn: "1d",
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "change-this-secret");
}
