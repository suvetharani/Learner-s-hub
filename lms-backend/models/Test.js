const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  type: String,
  required: Boolean,
  options: [String],
});

const testSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number, // in minutes
  totalMarks: Number,

  questions: [questionSchema], // ⭐ THIS WAS MISSING

  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Test", testSchema);