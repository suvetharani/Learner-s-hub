const mongoose = require("mongoose");

const academicResourceSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ["material", "question-paper"],
      required: true,
    },
    title: {
      type: String,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AcademicResource", academicResourceSchema);

