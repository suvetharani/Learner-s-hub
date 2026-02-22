const User = require("../models/User");

// ================= APPROVED STUDENTS =================
exports.getApprovedStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      status: "approved"
    }).select("-password");

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= PENDING STUDENTS =================
exports.getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      status: "pending"
    }).select("-password");

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= APPROVE STUDENT =================
exports.approveStudent = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      status: "approved"
    });

    res.json({ message: "Student approved successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};