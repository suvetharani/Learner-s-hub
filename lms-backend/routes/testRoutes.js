
const ExamResult = require("../models/ExamResult");
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Test = require("../models/Test");
const Violation = require("../models/Violation");
const upload = require("../middleware/upload");
const Groq = require("groq-sdk");

let groq = null;
if (process.env.OPENAI_API_KEY) {
  groq = new Groq({ apiKey: process.env.OPENAI_API_KEY });
}

async function extractTextFromFile(filePath, ext) {
  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }
  if (ext === ".pdf") {
    const pdfParse = require("pdf-parse");
    const buf = fs.readFileSync(filePath);
    const data = await pdfParse(buf);
    return data.text || "";
  }
  if (ext === ".doc" || ext === ".docx") {
    const mammoth = require("mammoth");
    const buf = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value || "";
  }
  return "";
}

async function generateQuestionsFromTextWithAI(text) {
  if (!groq || !text || text.trim().length < 50) return null;
  const prompt = `You are an expert educator. Given the following educational content, generate 5-8 assessment questions in JSON format.
Return ONLY a valid JSON array. Each question must have:
- "questionText": string
- "type": one of "mcq", "short", "paragraph"
- "correctAnswer": string (for mcq use the exact option text; for short/paragraph the expected answer)
- "options": array of 4 strings for mcq (include the correct answer among them)
- "points": number (1-5)

Content:
---
${text.slice(0, 6000)}
---

Example format:
[{"questionText":"What is X?","type":"short","correctAnswer":"...","options":[],"points":2},{"questionText":"Choose the best answer","type":"mcq","correctAnswer":"A","options":["A","B","C","D"],"points":3}]
Return only the JSON array, no other text.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });
    const raw = completion.choices[0]?.message?.content || "";
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map((q) => ({
      questionText: q.questionText || "",
      type: q.type === "mcq" ? "mcq" : q.type === "paragraph" ? "paragraph" : "short",
      required: true,
      correctAnswer: q.correctAnswer || "",
      points: typeof q.points === "number" ? q.points : 2,
      options: Array.isArray(q.options) ? q.options : [],
    }));
  } catch (e) {
    console.error("AI question generation failed:", e.message);
    return null;
  }
}

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

// Update test
router.put("/:id", async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Test not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate test from uploaded file (AI or rule-based)
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

      const fullPath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "materials",
        req.file.filename
      );
      const ext = path.extname(req.file.filename || originalName || "").toLowerCase();
      if (![".txt", ".pdf", ".doc", ".docx"].includes(ext)) {
        return res.status(400).json({ message: "Only .txt, .pdf, .doc, .docx are supported" });
      }

      let textContent = "";
      try {
        textContent = await extractTextFromFile(fullPath, ext);
      } catch (e) {
        console.error("File read error:", e);
      }

      let questions = [];

      if (textContent && textContent.trim().length >= 50) {
        questions = await generateQuestionsFromTextWithAI(textContent);
      }

      if (!questions || questions.length === 0) {
        const rawSentences = (textContent || "")
          .split(/[\.\?\!]\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);
        const selected = rawSentences.slice(0, 8);
        if (selected.length > 0) {
          questions = selected.map((sentence) => ({
            questionText: `Explain in your own words: ${sentence}`,
            type: "paragraph",
            required: true,
            correctAnswer: "",
            points: 5,
            options: [],
          }));
        } else {
          questions = [
            {
              questionText: `Describe the main ideas from: ${originalName}`,
              type: "paragraph",
              required: true,
              correctAnswer: "",
              points: 5,
              options: [],
            },
          ];
        }
      }

      const totalMarks = questions.reduce((sum, q) => sum + (q.points || 5), 0);

      const newTest = new Test({
        title,
        description,
        duration: 30,
        totalMarks,
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

// Submit exam (MUST be before /:id to avoid "submit" being captured as id)
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
    console.error("Exam submit error:", error);
    res.status(500).json({ message: "Failed to save exam" });
  }
});

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

// Get all tests (forStudent=true strips correctAnswer from questions)
router.get("/all", async (req, res) => {
  try {
    const tests = await Test.find().populate("instructor", "name email");
    const forStudent = req.query.forStudent === "true";
    if (forStudent && tests.length > 0) {
      const stripped = tests.map((t) => {
        const obj = t.toObject ? t.toObject() : { ...t };
        if (obj.questions) {
          obj.questions = obj.questions.map(({ correctAnswer, ...q }) => q);
        }
        return obj;
      });
      return res.json(stripped);
    }
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
    if (!test) return res.status(404).json({ message: "Test not found" });
    const forStudent = req.query.forStudent === "true";
    const obj = test.toObject ? test.toObject() : { ...test };
    if (forStudent && obj.questions) {
      obj.questions = obj.questions.map(({ correctAnswer, ...q }) => q);
    }
    res.json(obj);

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

module.exports = router;