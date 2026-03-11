const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const User = require("../models/User");
const Course = require("../models/Course");
const ExamResult = require("../models/ExamResult");
const Violation = require("../models/Violation");

let groq = null;
if (process.env.OPENAI_API_KEY) {
  // Reuse OPENAI_API_KEY env var, but it now stores the Groq key
  groq = new Groq({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function mapMessagesForGroq(messages, systemPrompt) {
  const mapped = messages.map((m) => ({
    role: m.from === "user" ? "user" : "assistant",
    content: m.text,
  }));
  return [
    {
      role: "system",
      content: systemPrompt,
    },
    ...mapped,
  ];
}

router.post("/student-chat", async (req, res) => {
  try {
    if (!groq) {
      return res
        .status(500)
        .json({ message: "OPENAI_API_KEY is not configured on the server." });
    }

    const { messages = [] } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: mapMessagesForGroq(
        messages,
        "You are a friendly AI tutor for college students. Explain concepts clearly, with examples, summaries, and step-by-step reasoning when helpful. Keep answers concise but helpful."
      ),
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (err) {
    console.error("Student chat error:", err);
    const status = err.status || 500;
    const message =
      err.error?.message ||
      (status === 401
        ? "AI key is invalid or unauthorized. Please check your API key."
        : status === 429
        ? "AI usage limit or quota exceeded. Please check your OpenAI plan and billing."
        : "Failed to generate AI response.");
    res.status(status).json({ message });
  }
});

router.post("/instructor-chat", async (req, res) => {
  try {
    if (!groq) {
      return res
        .status(500)
        .json({ message: "OPENAI_API_KEY is not configured on the server." });
    }

    const { messages = [] } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: mapMessagesForGroq(
        messages,
        "You are an AI assistant for instructors in a learning management system. Help with teaching ideas, explanations, test creation, rubrics, and student feedback. When appropriate, suggest concrete examples, question ideas, and ways to improve learning outcomes."
      ),
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (err) {
    console.error("Instructor chat error:", err);
    const status = err.status || 500;
    const message =
      err.error?.message ||
      (status === 401
        ? "AI key is invalid or unauthorized. Please check your API key."
        : status === 429
        ? "AI usage limit or quota exceeded. Please check your OpenAI plan and billing."
        : "Failed to generate AI response.");
    res.status(status).json({ message });
  }
});

router.get("/instructor/student-analytics", async (req, res) => {
  try {
    const q = (req.query.q || req.query.name || "").trim();
    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    const regex = new RegExp(q, "i");

    const student = await User.findOne({
      role: "student",
      $or: [{ name: regex }, { rollNumber: regex }, { email: regex }],
    })
      .select("name email rollNumber")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentId = student._id;

    const [courses, results, violations] = await Promise.all([
      Course.find({ students: studentId }).select("name").lean(),
      ExamResult.find({ student: studentId }).populate("test", "title").lean(),
      Violation.find({ student: studentId }).lean(),
    ]);

    const testsTaken = results.length;
    const uniqueTests = new Set(
      results.map((r) => (r.test ? r.test._id.toString() : null)).filter(Boolean)
    ).size;
    const terminatedCount = results.filter((r) => r.terminated).length;

    const lastExam =
      results.length > 0
        ? results.reduce((latest, r) =>
            !latest || r.submittedAt > latest ? r.submittedAt : latest
          , null)
        : null;

    const violationsByType = violations.reduce((acc, v) => {
      if (!v.type) return acc;
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      student,
      courses: courses.map((c) => ({ id: c._id, name: c.name })),
      tests: {
        attempts: testsTaken,
        uniqueTests,
        terminated: terminatedCount,
        lastExam,
      },
      violations: {
        total: violations.length,
        byType: violationsByType,
      },
    });
  } catch (err) {
    console.error("Student analytics error:", err);
    res.status(500).json({ message: "Failed to load student analytics" });
  }
});

module.exports = router;

