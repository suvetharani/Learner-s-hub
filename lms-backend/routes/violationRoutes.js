const express = require("express");
const router = express.Router();
const Violation = require("../models/Violation");

router.post("/", async (req, res) => {

  const { student, test, type } = req.body;

  const violation = new Violation({
    student,
    test,
    type
  });

  await violation.save();

  res.json({ message: "Violation recorded" });

});

module.exports = router;