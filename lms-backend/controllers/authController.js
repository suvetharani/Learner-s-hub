const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ADMIN_SECRET = process.env.ADMIN_SECRET;

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    // Prevent fake admin signup
    if (role === "admin") {
      if (adminSecret !== ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin secret key" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status: role === "admin" ? "approved" : "pending"
    });

    await user.save();

    res.status(201).json({
      message: role === "student"
        ? "Signup successful. Wait for admin approval."
        : "Admin account created"
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

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
