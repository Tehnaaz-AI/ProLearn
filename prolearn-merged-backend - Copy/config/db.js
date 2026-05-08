const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (
      !process.env.MONGO_URI ||
      process.env.MONGO_URI === "your_mongodb_connection_string"
    ) {
      throw new Error("Please set MONGO_URI in app.env to a valid MongoDB connection string.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
