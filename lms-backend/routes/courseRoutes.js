const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");


// ========================================
// 🔹 CREATE COURSE (Instructor)
// ========================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Course name required" });
    }

    const newCourse = new Course({
      name,
      description,
      instructor: req.user.id,
      students: [],
      joinRequests: [],
      materials: [],
      status: "pending", // default pending
    });

    await newCourse.save();

    res.status(201).json(newCourse);
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ message: "Server error while creating course" });
  }
});


// ========================================
// 🔹 GET ALL APPROVED COURSES (Public)
// ========================================
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email") // 🔥 IMPORTANT
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 🔹 GET LOGGED-IN INSTRUCTOR COURSES
// ========================================
router.get("/instructor", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({
      instructor: req.user.id,
    })
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ========================================
// 🔹 STUDENT REQUEST TO JOIN
// ========================================
router.put("/:courseId/request/:studentId", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.joinRequests.includes(req.params.studentId)) {
      course.joinRequests.push(req.params.studentId);
    }

    await course.save();
    res.json({ message: "Request sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 APPROVE STUDENT
// ========================================
router.put("/:courseId/approve/:studentId", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: "Course not found" });

    course.joinRequests = course.joinRequests.filter(
      (id) => id.toString() !== req.params.studentId
    );

    if (!course.students.includes(req.params.studentId)) {
      course.students.push(req.params.studentId);
    }

    await course.save();
    res.json({ message: "Student approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 GET JOIN REQUESTS
// ========================================
router.get("/:courseId/requests", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate(
      "joinRequests",
      "name email"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.joinRequests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 GET ENROLLED STUDENTS
// ========================================
router.get("/:courseId/students", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate(
      "students",
      "name email"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course.students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 UPLOAD MATERIAL
// ========================================
router.post(
  "/:courseId/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) return res.status(404).json({ message: "Course not found" });

      course.materials.push({
        fileName: req.file.originalname,
        fileUrl: req.file.path,
      });

      await course.save();

      res.json({ message: "File uploaded successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


// ========================================
// 🔹 ADMIN APPROVE COURSE
// ========================================
router.put("/:courseId/approve-course", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: "Course not found" });

    course.status = "approved";
    await course.save();

    res.json({ message: "Course approved by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// 🔹 DELETE MATERIAL (ONLY OWNER)
// ========================================
router.delete(
  "/:courseId/material/:index",
  authMiddleware,
  async (req, res) => {
    try {
      const course = await Course.findOne({
        _id: req.params.courseId,
        instructor: req.user.id,
      });

      if (!course) {
        return res.status(404).json({ message: "Not authorized" });
      }

      const materialIndex = parseInt(req.params.index);

      if (materialIndex < 0 || materialIndex >= course.materials.length) {
        return res.status(400).json({ message: "Invalid material index" });
      }

      // Remove from database
      course.materials.splice(materialIndex, 1);

      await course.save();

      res.json({ message: "Material deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
