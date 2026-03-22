const mongoose = require("mongoose");

const topicMediaSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  topicId: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  path: { type: String, required: true },
  originalName: { type: String },
  durationSeconds: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TopicMedia", topicMediaSchema);
