
const ExamResult = require("../models/ExamResult");
const express = require("express");
const router = express.Router();
const Test = require("../models/Test");

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

// Get all tests
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
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

    const result = new ExamResult({
      student: studentId,
      test: testId,
      answers: answers,
      terminated: terminated
    });

    await result.save();

    res.json({ message: "Exam answers saved successfully" });

  } catch (error) {

    console.log(error);
    res.status(500).json({ message: "Failed to save exam" });

  }

});

module.exports = router;