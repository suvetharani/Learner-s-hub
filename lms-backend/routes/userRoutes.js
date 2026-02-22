const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  getApprovedStudents,
  getPendingStudents,
  approveStudent
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
    }).select("name email degree specialization experience bio");

    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;