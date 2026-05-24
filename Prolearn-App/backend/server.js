import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import instructorRoutes from "./src/routes/instructorRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import featureRoutes from "./src/routes/featureRoutes.js";
import { seedDefaults } from "./src/seedDefaults.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, stack: "MERN", database: "MongoDB" });
});

app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", courseRoutes);
app.use("/api", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", featureRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error." });
});

try {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("MongoDB connected!");
  
  try {
    const seedTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Seed timeout")), 10000)
    );
    await Promise.race([seedDefaults(), seedTimeout]);
  } catch (seedErr) {
  }
  
  console.log("Starting express server...");
  const server = app.listen(port, () => {
    console.log(`ProLearn backend running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    console.error("SERVER ERROR:", err);
  });
  
} catch (err) {
  console.error("ERROR STARTING SERVER:", err);
  process.exit(1);
}
