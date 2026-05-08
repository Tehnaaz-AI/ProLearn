const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    let roles = ["student"];
    if (req.body.role === "instructor") {
      roles = ["student", "instructor"];
    } else if (req.body.role === "admin") {
      roles = ["student", "instructor", "admin"];
    }

    const user = await User.create({
      name,
      email,
      password,
      role: req.body.role || "student",
      roles
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json(safeUser);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    res.json({ token, user: safeUser });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
