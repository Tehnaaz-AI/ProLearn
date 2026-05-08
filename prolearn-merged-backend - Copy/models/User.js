const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["student", "instructor", "admin"],
    default: "student"
  },

  roles: {
    type: [String],
    enum: ["student", "instructor", "admin"],
    default: ["student"]
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  // Courses purchased (for students)
  enrolledCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
      },
      progressPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      completedLectures: [
        {
          type: mongoose.Schema.Types.ObjectId
        }
      ],
      enrolledAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Courses created (for instructors)
  createdCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }
  ],

  // Optional profile
  avatar: {
    type: String
  },

  bio: {
    type: String
  }

}, {
  timestamps: true
});
const bcrypt = require("bcryptjs");

userSchema.pre("save", async function () {
  if (!this.roles || this.roles.length === 0) {
    this.roles = [this.role || "student"];
  }

  if (!this.roles.includes(this.role)) {
    this.roles.push(this.role);
  }

  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
