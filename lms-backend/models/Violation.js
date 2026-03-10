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

  type: String,
  time: Date

});

module.exports = mongoose.model("Violation", violationSchema);