const mongoose = require("mongoose");

const examResultSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true
  },

  answers: [
    {
      questionIndex: Number,
      answer: String
    }
  ],

  terminated: {
    type: Boolean,
    default: false
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("ExamResult", examResultSchema);