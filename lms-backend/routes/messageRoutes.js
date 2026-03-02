const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* SEND MESSAGE */
router.post("/send", upload.single("image"), async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text,
      image: req.file ? "uploads/" + req.file.filename : null,
    });

    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET CONVERSATION */
router.get("/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: user1, receiver: user2 },
      { sender: user2, receiver: user1 },
    ],
  }).sort({ createdAt: 1 });

  res.json(messages);
});

/* DELETE SINGLE MESSAGE */
router.delete("/:id", async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: "Message deleted" });
});

module.exports = router;