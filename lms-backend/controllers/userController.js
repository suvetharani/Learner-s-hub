const User = require("../models/User");
const Course = require("../models/Course");
const Test = require("../models/Test");
const Message = require("../models/Message");
const ExamResult = require("../models/ExamResult");

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

exports.getCourseProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("learning");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(
      user.learning || {
        readTopicIds: [],
        completedCourseIds: [],
        totalPoints: 0
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackCourseTopic = async (req, res) => {
  try {
    const { userId, courseId, topicId, coursePoints = 0, completed = false } = req.body;
    if (!userId || !courseId || !topicId) {
      return res.status(400).json({
        message: "userId, courseId and topicId are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.learning) {
      user.learning = {
        readTopicIds: [],
        completedCourseIds: [],
        totalPoints: 0
      };
    }

    const topicKey = `${courseId}:${topicId}`;
    if (!user.learning.readTopicIds.includes(topicKey)) {
      user.learning.readTopicIds.push(topicKey);
    }

    let pointsAdded = 0;
    if (completed && !user.learning.completedCourseIds.includes(courseId)) {
      user.learning.completedCourseIds.push(courseId);
      pointsAdded = Number(coursePoints) || 0;
      user.learning.totalPoints += pointsAdded;
    }

    await user.save();

    res.json({
      message: "Course progress updated",
      pointsAdded,
      learning: user.learning
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPointsRanking = async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      status: "approved"
    }).select("name learning");

    const ranking = students
      .map((s) => ({
        _id: s._id,
        name: s.name,
        points: s.learning?.totalPoints || 0
      }))
      .sort((a, b) => b.points - a.points);

    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRecentCourse = async (req, res) => {
  try {
    const { userId, course } = req.body;
    if (!userId || !course?.id) {
      return res.status(400).json({ message: "userId and course are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.learning) {
      user.learning = {
        readTopicIds: [],
        completedCourseIds: [],
        totalPoints: 0,
        recentCourses: []
      };
    }

    if (!Array.isArray(user.learning.recentCourses)) {
      user.learning.recentCourses = [];
    }

    const idx = user.learning.recentCourses.findIndex((c) => c.id === course.id);
    const entry = {
      id: course.id,
      name: course.name,
      domain: course.domain,
      progress: course.progress || 0,
      points: course.points || 0,
      lastAccessed: new Date()
    };

    if (idx >= 0) {
      user.learning.recentCourses[idx] = entry;
    } else {
      user.learning.recentCourses.unshift(entry);
    }

    user.learning.recentCourses = user.learning.recentCourses.slice(0, 10);
    await user.save();

    res.json(user.learning.recentCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("learning.recentCourses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.learning?.recentCourses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "student") {
      await Course.updateMany({}, {
        $pull: {
          students: user._id,
          joinRequests: user._id
        }
      });
      await ExamResult.deleteMany({ student: user._id });
    } else {
      await Course.deleteMany({ instructor: user._id });
      await Test.deleteMany({ instructor: user._id });
    }

    await Message.deleteMany({
      $or: [{ sender: user._id }, { receiver: user._id }]
    });

    await User.findByIdAndDelete(id);

    res.json({ message: "Profile deleted permanently" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [tests, courses, messages] = await Promise.all([
      Test.find().sort({ createdAt: -1 }).limit(15).select("title createdAt").lean(),
      Course.find({ students: id })
        .populate("instructor", "name")
        .sort({ updatedAt: -1 })
        .limit(15)
        .select("name instructor updatedAt")
        .lean(),
      Message.find({ receiver: id })
        .populate("sender", "name")
        .sort({ createdAt: -1 })
        .limit(20)
        .select("sender createdAt")
        .lean()
    ]);

    const items = [
      ...tests.map((t) => ({
        type: "test",
        text: `New test added: ${t.title}`,
        createdAt: t.createdAt
      })),
      ...courses.map((c) => ({
        type: "classroom",
        text: `You are enrolled in classroom: ${c.name}`,
        createdAt: c.updatedAt
      })),
      ...messages.map((m) => ({
        type: "message",
        text: `New message from ${m.sender?.name || "a user"}`,
        createdAt: m.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInstructorNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("name");
    if (!user) return res.status(404).json({ message: "User not found" });

    const [coursesWithRequests, messages] = await Promise.all([
      Course.find({
        instructor: id,
        joinRequests: { $exists: true, $ne: [] }
      })
        .populate("joinRequests", "name")
        .sort({ updatedAt: -1 })
        .limit(20)
        .select("name joinRequests updatedAt")
        .lean(),
      Message.find({ receiver: id })
        .populate("sender", "name")
        .sort({ createdAt: -1 })
        .limit(20)
        .select("sender createdAt")
        .lean()
    ]);

    const requestItems = [];
    coursesWithRequests.forEach((course) => {
      course.joinRequests.forEach((student) => {
        requestItems.push({
          type: "request",
          text: `${student.name} requested to join ${course.name}`,
          createdAt: course.updatedAt
        });
      });
    });

    const items = [
      ...requestItems,
      ...messages.map((m) => ({
        type: "message",
        text: `New message from ${m.sender?.name || "a user"}`,
        createdAt: m.createdAt
      }))
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};