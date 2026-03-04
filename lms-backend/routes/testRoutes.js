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

// 🔥 Get single test by ID
router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    res.json(test);
  } catch (error) {
    res.status(500).json({ error: error.message });
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