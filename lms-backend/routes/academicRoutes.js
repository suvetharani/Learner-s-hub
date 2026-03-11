const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const AcademicResource = require("../models/AcademicResource");

// POST /api/academics/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { semester, resourceType, title } = req.body;

      if (!semester || !resourceType) {
        return res
          .status(400)
          .json({ message: "semester and resourceType are required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const resource = new AcademicResource({
        semester: Number(semester),
        resourceType, // "material" | "question-paper"
        title: title || req.file.originalname,
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        uploadedBy: req.user?.id,
      });

      await resource.save();

      res.json({ message: "Resource uploaded successfully", resource });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/academics?semester=1&type=material
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { semester, type } = req.query;

    const query = {};
    if (semester) query.semester = Number(semester);
    if (type) query.resourceType = type;

    const resources = await AcademicResource.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/academics/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await AcademicResource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    await AcademicResource.findByIdAndDelete(id);

    return res.json({ message: "Resource deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;

