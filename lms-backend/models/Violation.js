const mongoose = require("mongoose");

const violationSchema = new mongoose.Schema({

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  studentSnapshot: {
    name: { type: String },
    email: { type: String },
    rollNumber: { type: String }
  },

  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test"
  },

  type: String, // tab-switch, noise, no-face, camera-off, multiple-faces, look-away, look-down, copy-attempt

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Violation", violationSchema);