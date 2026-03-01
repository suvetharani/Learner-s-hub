const multer = require("multer");
const path = require("path");

// 🔹 Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/materials/");   // store course materials separately
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// 🔹 File Filter (Allow only PDF & Word)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Word files are allowed"), false);
  }
};

// 🔹 Upload Middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;