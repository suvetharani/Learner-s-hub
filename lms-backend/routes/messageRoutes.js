const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Send Message
router.post("/send", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get conversation between 2 users
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete conversation
router.delete("/delete/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    await Message.deleteMany({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    });

    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;