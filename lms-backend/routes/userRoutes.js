const express = require("express");
const router = express.Router();

const {
  getApprovedStudents,
  getPendingStudents,
  approveStudent
} = require("../controllers/userController");

// GET approved students
router.get("/students/approved", getApprovedStudents);

// GET pending students
router.get("/students/pending", getPendingStudents);

// Approve student
router.put("/students/approve/:id", approveStudent);

module.exports = router;