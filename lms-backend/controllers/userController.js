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

// ================= STUDY TIME TRACKING =================

exports.trackStudyTime = async (req, res) => {
  try {
    const { userId, seconds, date } = req.body;

    if (!userId || !seconds || !date) {
      return res.status(400).json({ message: "userId, seconds and date are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeSeconds = Number(seconds) || 0;
    if (!user.studyTime) {
      user.studyTime = {
        totalSeconds: 0,
        daily: []
      };
    }

    user.studyTime.totalSeconds += safeSeconds;

    const existing = user.studyTime.daily.find((d) => d.date === date);
    if (existing) {
      existing.seconds += safeSeconds;
    } else {
      user.studyTime.daily.push({ date, seconds: safeSeconds });
    }

    await user.save();

    res.json({ message: "Study time updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyStudyTime = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("studyTime");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(
      user.studyTime || {
        totalSeconds: 0,
        daily: []
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudyRanking = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      status: "approved"
    }).select("name studyTime");

    const withTotals = students
      .map((s) => ({
        _id: s._id,
        name: s.name,
        totalSeconds: s.studyTime?.totalSeconds || 0
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

    res.json(withTotals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};