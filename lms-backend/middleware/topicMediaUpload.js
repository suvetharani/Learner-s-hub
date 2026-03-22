const multer = require("multer");
const path = require("path");
const fs = require("fs");

const dir = "uploads/topic-media";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos (mp4, webm) up to 5 mins are allowed"), false);
  }
};

// ~100MB for 5 min video
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});
