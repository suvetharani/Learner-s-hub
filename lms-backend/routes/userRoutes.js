const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  getApprovedStudents,
  getPendingStudents,
  approveStudent,
  trackStudyTime,
  getMyStudyTime,
  getStudyRanking,
  getCourseProgress,
  trackCourseTopic,
  getPointsRanking,
  updateRecentCourse,
  getRecentCourses,
  deleteProfile,
  getStudentNotifications,
  getInstructorNotifications,
} = require("../controllers/userController");


// ================= STUDENT ROUTES =================

// GET approved students
router.get("/students/approved", getApprovedStudents);

// GET pending students
router.get("/students/pending", getPendingStudents);

// Approve student
router.put("/students/approve/:id", approveStudent);


// ================= INSTRUCTOR ROUTE =================

// GET all approved instructors
router.get("/instructors", async (req, res) => {
  try {
    const instructors = await User.find({
      role: "admin",
      status: "approved"
    }).select("name email degree specialization experience bio profileImage");

    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// upload

const upload = require("../middleware/upload");

// Get logged in user profile
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/profile/:id", deleteProfile);

// Upload profile image
router.put("/profile/image/:id", upload.single("image"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: "uploads/" + req.file.filename },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all users for messages
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select(
      "name email role status profileImage"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= STUDY TIME ROUTES =================

router.post("/studytime/track", trackStudyTime);
router.get("/studytime/me/:id", getMyStudyTime);
router.get("/studytime/ranking", getStudyRanking);
router.get("/course-progress/:id", getCourseProgress);
router.post("/course-progress/track", trackCourseTopic);
router.get("/points/ranking", getPointsRanking);
router.post("/recent-courses/track", updateRecentCourse);
router.get("/recent-courses/:id", getRecentCourses);
router.get("/notifications/student/:id", getStudentNotifications);
router.get("/notifications/instructor/:id", getInstructorNotifications);

module.exports = router;