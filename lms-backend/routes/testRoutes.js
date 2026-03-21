
const ExamResult = require("../models/ExamResult");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Test = require("../models/Test");
const Violation = require("../models/Violation");
const upload = require("../middleware/upload");

// Create test
router.post("/", async (req, res) => {
  try {
    const newTest = new Test(req.body);
    await newTest.save();
    res.status(201).json(newTest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate test from uploaded file (simple text-based extraction)
router.post(
  "/generate-from-file",
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const originalName = req.file.originalname || "Uploaded Test";
      const baseTitle = originalName.replace(/\.[^/.]+$/, "");
      const title = req.body.title || baseTitle || "Uploaded Test";
      const description =
        req.body.description ||
        `Automatically generated test from ${originalName}`;

      let textContent = "";
      const ext = path.extname(req.file.filename || "").toLowerCase();

      // Only try to read plain text; other formats will still create a simple generic question
      if (ext === ".txt") {
        const fullPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "materials",
          req.file.filename
        );
        try {
          textContent = fs.readFileSync(fullPath, "utf-8");
        } catch {
          textContent = "";
        }
      }

      let questions = [];

      if (textContent) {
        const rawSentences = textContent
          .split(/[\.\?\!]\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);

        const selected = rawSentences.slice(0, 8);

        questions = selected.map((sentence) => ({
          questionText: `Explain in your own words: ${sentence}`,
          type: "paragraph",
          required: true,
          options: [],
        }));
      }

      if (questions.length === 0) {
        questions = [
          {
            questionText: `Describe the main ideas from: ${originalName}`,
            type: "paragraph",
            required: true,
            options: [],
          },
        ];
      }

      const newTest = new Test({
        title,
        description,
        duration: 30,
        totalMarks: questions.length * 5,
        questions,
      });

      await newTest.save();

      res.status(201).json(newTest);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get all tests
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Basic stats for analytics
router.get("/stats/summary", async (req, res) => {
  try {
    const [totalTests, resultsCount] = await Promise.all([
      Test.countDocuments(),
      ExamResult.countDocuments(),
    ]);

    res.json({
      totalTests,
      resultsCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 Get all tests (if you're using /all)
router.get("/all", async (req, res) => {
  try {
    const tests = await Test.find().populate("instructor", "name email");
    res.json(tests);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Responses + violations for one test
router.get("/:id/responses", async (req, res) => {
  try {
    const testId = req.params.id;

    const [results, violations] = await Promise.all([
      ExamResult.find({ test: testId })
        .populate("student", "name email rollNumber")
        .lean(),
      Violation.find({ test: testId }).lean(),
    ]);

    const responses = results.map((r) => {
      const studentId = r.student?._id?.toString();
      const relatedViolations = violations.filter((v) => {
        if (v.student) {
          return v.student.toString() === studentId;
        }
        if (v.studentSnapshot?.rollNumber && r.student?.rollNumber) {
          return v.studentSnapshot.rollNumber === r.student.rollNumber;
        }
        return false;
      });

      return {
        _id: r._id,
        student: r.student,
        terminated: r.terminated,
        submittedAt: r.submittedAt,
        answers: r.answers,
        violations: relatedViolations,
      };
    });

    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 Get single test by ID (MUST BE LAST)
router.get("/:id", async (req, res) => {
  try {

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

router.post("/submit", async (req, res) => {

  try {

    const { studentId, testId, answers, terminated } = req.body;
    if (!studentId || !testId) {
      return res.status(400).json({
        message: "studentId and testId are required"
      });
    }

    const result = new ExamResult({
      student: studentId,
      test: testId,
      answers: Array.isArray(answers) ? answers : [],
      terminated: Boolean(terminated)
    });

    await result.save();

    res.json({ message: "Exam answers saved successfully" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to save exam" });

  }

});

module.exports = router;