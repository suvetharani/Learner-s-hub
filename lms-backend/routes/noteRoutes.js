const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const authMiddleware = require("../middleware/authMiddleware");

// Get all notes for logged in user
router.get("/", authMiddleware, async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
  res.json(notes);
});

// Update note
router.put("/:id", authMiddleware, async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Note not found" });

  if (note.user.toString() !== req.user.id)
    return res.status(401).json({ message: "Not authorized" });

  note.title = req.body.title;
  note.content = req.body.content;

  await note.save();
  res.json(note);
});

// Delete note
router.delete("/:id", authMiddleware, async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Note not found" });

  if (note.user.toString() !== req.user.id)
    return res.status(401).json({ message: "Not authorized" });

  await note.deleteOne();
  res.json({ message: "Note deleted" });
});

// Create note
router.post("/", authMiddleware, async (req, res) => {
  const note = new Note({
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
  });

  const saved = await note.save();
  res.json(saved);
});

module.exports = router;