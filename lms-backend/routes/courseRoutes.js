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
      status: "pending",
    });

    await newCourse.save();
    res.status(201).json(newCourse);

  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ message: "Server error while creating course" });
  }
});


// ========================================
// 🔹 GET ALL COURSES
// ========================================
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name email")
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
// 🔹 STUDENT REQUEST TO JOIN (FIXED)
// ========================================
router.put("/:courseId/request", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const studentId = req.user.id;

    // Already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    // Already requested
    if (course.joinRequests.includes(studentId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    course.joinRequests.push(studentId);
    await course.save();

    res.json({ message: "Join request sent successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 APPROVE STUDENT (Instructor)
// ========================================
router.put("/:courseId/approve/:studentId", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const studentId = req.params.studentId;

    // Remove from joinRequests
    course.joinRequests = course.joinRequests.filter(
      (id) => id.toString() !== studentId
    );

    // Add to students if not exists
    if (!course.students.includes(studentId)) {
      course.students.push(studentId);
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
    const course = await Course.findById(req.params.courseId)
      .populate("joinRequests", "name email");

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    res.json(course.joinRequests);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ========================================
// 🔹 GET COURSES WITH STUDENT STATUS
// ========================================
router.get("/student", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    const updatedCourses = courses.map((course) => {
      const isEnrolled = course.students.some(
        (student) => student.toString() === userId
      );

      const isRequested = course.joinRequests.some(
        (student) => student.toString() === userId
      );

      return {
        ...course.toObject(),
        isEnrolled,
        isRequested,
      };
    });

    res.json(updatedCourses);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ========================================
// 🔹 GET ENROLLED STUDENTS
// ========================================
router.get("/:courseId/students", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("students", "name email");

    if (!course)
      return res.status(404).json({ message: "Course not found" });

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

      if (!course)
        return res.status(404).json({ message: "Course not found" });

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
// 🔹 DELETE MATERIAL
// ========================================
router.delete("/:courseId/material/:index", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const index = req.params.index;

    course.materials.splice(index, 1);

    await course.save();

    res.json({ message: "Material deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ========================================
// 🔹 ADMIN APPROVE COURSE
// ========================================
router.put("/:courseId/approve-course", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    course.status = "approved";
    await course.save();

    res.json({ message: "Course approved by admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========================================
// 🔹 GET COURSE MATERIALS (Student - Enrolled Only)
// ========================================
router.get("/:courseId/materials", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course)
      return res.status(404).json({ message: "Course not found" });

    const userId = req.user.id;

    // 🔥 Allow only enrolled students
    const isEnrolled = course.students.some(
      (student) => student.toString() === userId
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: "Access denied. Not enrolled." });
    }

    res.json(course.materials);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;