const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test"
  },

  type: String, // tab-switch, noise, no-face, camera-off

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Violation", violationSchema);