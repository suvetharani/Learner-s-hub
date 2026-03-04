const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  type: String,
  required: Boolean,
  options: [String],
});

const testSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    courseId: String,
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Test", testSchema);