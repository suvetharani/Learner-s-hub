const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

router.post("/log", async (req, res) => {

  try {

    const violation = new Violation(req.body);
    await violation.save();

    res.json({ message: "Violation logged" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

module.exports = router;