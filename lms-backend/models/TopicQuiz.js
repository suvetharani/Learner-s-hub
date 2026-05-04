const mongoose = require("mongoose");

const topicQuizQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length >= 2 && v.every((o) => String(o).trim().length > 0);
        },
        message: "At least two non-empty options are required.",
      },
    },
    correctAnswer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const topicQuizSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true, trim: true, index: true },
    topicId: { type: String, required: true, trim: true },
    questions: {
      type: [topicQuizQuestionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

topicQuizSchema.index({ courseId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("TopicQuiz", topicQuizSchema);
