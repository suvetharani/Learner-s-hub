const express = require("express");
const router = express.Router();
const TopicMedia = require("../models/TopicMedia");
const topicMediaUpload = require("../middleware/topicMediaUpload");

// Get all media for a topic
router.get("/:courseId/:topicId", async (req, res) => {
  try {
    const { courseId, topicId } = req.params;
    const media = await TopicMedia.find({ courseId, topicId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload media for a topic
router.post(
  "/:courseId/:topicId",
  topicMediaUpload.single("media"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }
      const { courseId, topicId } = req.params;
      const isVideo = req.file.mimetype.startsWith("video/");
      const isImage = req.file.mimetype.startsWith("image/");

      const media = new TopicMedia({
        courseId,
        topicId,
        type: isVideo ? "video" : isImage ? "image" : "image",
        path: `uploads/topic-media/${req.file.filename}`,
        originalName: req.file.originalname,
        uploadedBy: req.body.instructorId || null,
      });

      await media.save();
      res.status(201).json(media);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete media
router.delete("/:id", async (req, res) => {
  try {
    const media = await TopicMedia.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    res.json({ message: "Media deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
