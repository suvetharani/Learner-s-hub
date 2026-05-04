const express = require("express");
const router = express.Router();
const TopicQuiz = require("../models/TopicQuiz");

function normalizeParams(courseId, topicId) {
  return {
    courseId: String(courseId ?? "").trim(),
    topicId: String(topicId ?? "").trim(),
  };
}

function stripAnswers(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  plain.questions = (plain.questions || []).map((q) => {
    const { correctAnswer: _omit, ...rest } = q;
    return rest;
  });
  return plain;
}

// Topic ids under a course that have at least one question
router.get("/course/:courseId/topics", async (req, res) => {
  try {
    const { courseId } = normalizeParams(req.params.courseId, "");
    const rows = await TopicQuiz.find({ courseId }).select("topicId questions").lean();
    const topicIdsWithQuiz = rows
      .filter((r) => Array.isArray(r.questions) && r.questions.length > 0)
      .map((r) => r.topicId);
    res.json({ topicIdsWithQuiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:courseId/:topicId", async (req, res) => {
  try {
    const { courseId, topicId } = normalizeParams(req.params.courseId, req.params.topicId);
    const forStudent = req.query.forStudent === "true";
    const doc = await TopicQuiz.findOne({ courseId, topicId });
    if (!doc) {
      return res.status(404).json({ message: "No quiz for this topic" });
    }
    if (forStudent) {
      return res.json(stripAnswers(doc));
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:courseId/:topicId", async (req, res) => {
  try {
    const { courseId, topicId } = normalizeParams(req.params.courseId, req.params.topicId);
    const { questions } = req.body || {};
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: "questions array is required" });
    }

    const cleaned = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const questionText = String(q.questionText || "").trim();
      const options = (Array.isArray(q.options) ? q.options : [])
        .map((o) => String(o || "").trim())
        .filter(Boolean);
      const correctAnswer = String(q.correctAnswer || "").trim();
      if (!questionText) {
        return res.status(400).json({ message: `Question ${i + 1} is missing text` });
      }
      if (options.length < 2) {
        return res.status(400).json({ message: `Question ${i + 1} needs at least two options` });
      }
      if (!options.includes(correctAnswer)) {
        return res.status(400).json({
          message: `Question ${i + 1}: correct answer must match one of the options`,
        });
      }
      cleaned.push({ questionText, options, correctAnswer });
    }

    const doc = await TopicQuiz.findOneAndUpdate(
      { courseId, topicId },
      { courseId, topicId, questions: cleaned },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );
    if (!doc) {
      return res.status(500).json({ message: "Could not save quiz to database" });
    }
    res.json(doc);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate quiz key" });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:courseId/:topicId", async (req, res) => {
  try {
    const { courseId, topicId } = normalizeParams(req.params.courseId, req.params.topicId);
    await TopicQuiz.deleteOne({ courseId, topicId });
    res.json({ message: "Quiz removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:courseId/:topicId/verify", async (req, res) => {
  try {
    const { courseId, topicId } = normalizeParams(req.params.courseId, req.params.topicId);
    const { answers } = req.body || {};
    const doc = await TopicQuiz.findOne({ courseId, topicId });
    if (!doc || !doc.questions?.length) {
      return res.status(404).json({ message: "No quiz for this topic" });
    }
    const list = doc.questions;
    if (!Array.isArray(answers) || answers.length !== list.length) {
      return res.status(400).json({
        message: "answers must be an array with one entry per question",
        passed: false,
      });
    }

    const normalize = (s) => String(s ?? "").trim().toLowerCase();
    let correctCount = 0;
    const perQuestion = list.map((q, idx) => {
      const sel = normalize(answers[idx]);
      const ok = normalize(q.correctAnswer) === sel && sel.length > 0;
      if (ok) correctCount += 1;
      return { correct: ok };
    });
    const passed = correctCount === list.length;
    res.json({
      passed,
      correctCount,
      total: list.length,
      perQuestion,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
