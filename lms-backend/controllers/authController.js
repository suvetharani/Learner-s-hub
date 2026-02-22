const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_SECRET = process.env.ADMIN_SECRET;

exports.signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      roll,
      adminSecret,
      degree,
      specialization,
      experience,
      bio
    } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Admin secret validation
    if (role === "admin") {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret key" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      rollNumber: role === "student" ? roll : undefined,
      password: hashedPassword,
      role,
      status: role === "admin" ? "approved" : "pending",
      degree: role === "admin" ? degree : undefined,
      specialization: role === "admin" ? specialization : undefined,
      experience: role === "admin" ? experience : undefined,
      bio: role === "admin" ? bio : undefined
    });

    await user.save();

    res.status(201).json({
      message:
        role === "student"
          ? "Signup successful. Wait for admin approval."
          : "Instructor account created successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student" && user.status !== "approved") {
      return res.status(403).json({ message: "Admin approval required" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

res.json({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
