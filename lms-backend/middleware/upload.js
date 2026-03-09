const multer = require("multer");

// 🔹 Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Decide folder based on file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/");
    } else {
      cb(null, "uploads/materials/");
    }
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// 🔹 File Filter (Allow PDF, Word & Images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // PDF & Word
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Images
    "image/jpeg",
    "image/png",
    "image/jpg"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, and Image files are allowed"), false);
  }
};

// 🔹 Upload Middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;