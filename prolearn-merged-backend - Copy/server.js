const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authroutes");
const adminRoutes = require("./routes/adminroutes");
const courseRoutes = require("./routes/courseroutes");
const userRoutes = require("./routes/userroutes");
const instructorRoutes = require("./routes/instructorroutes");
const reviewRoutes = require("./routes/reviewroutes");
const paymentRoutes = require("./routes/paymentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const progressRoutes = require("./routes/progressRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((error, req, res, next) => {
  if (error.message === "Only video files are allowed") {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Video file is too large" });
  }

  res.status(500).json({ message: error.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
