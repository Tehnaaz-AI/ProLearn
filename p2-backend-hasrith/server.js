const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

require("./models/User"); // register User model

const app = express();
app.use(cors());
app.use(express.json());

// Routes (we'll add these one by one)
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/lectures", require("./routes/lectureRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));

app.get("/", (req, res) => res.send("P2 Backend Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));