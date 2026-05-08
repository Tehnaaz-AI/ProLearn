const multer = require("multer");

const storage = multer.memoryStorage();

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("video/")) {
      return cb(new Error("Only video files are allowed"));
    }

    cb(null, true);
  }
});

module.exports = {
  videoUpload
};
