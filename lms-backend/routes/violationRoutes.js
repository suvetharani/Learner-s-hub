const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");
const User = require("../models/User");

router.post("/", async (req, res) => {
  try {
    const { student, test, type } = req.body;

    if (!student || !test || !type) {
      return res.status(400).json({ message: "student, test and type are required" });
    }

    let studentSnapshot = undefined;
    try {
      if (student) {
        const user = await User.findById(student).select("name email rollNumber").lean();
        if (user) {
          studentSnapshot = {
            name: user.name,
            email: user.email,
            rollNumber: user.rollNumber
          };
        }
      }
    } catch (e) {
      // Don't block violation recording if snapshot lookup fails
    }

    const violation = new Violation({
      student,
      studentSnapshot,
      test,
      type
    });

    await violation.save();

    res.json({ message: "Violation recorded" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;