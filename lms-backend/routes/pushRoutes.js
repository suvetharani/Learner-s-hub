const express = require("express");
const router = express.Router();
const {
  isPushConfigured,
  publicKey,
  registerSubscription,
  unregisterSubscription,
  sendPushToUser,
} = require("../services/pushService");

router.get("/config", (req, res) => {
  res.json({
    configured: isPushConfigured,
    publicKey: publicKey || null,
  });
});

router.post("/subscribe", async (req, res) => {
  try {
    const { userId, subscription } = req.body;
    const saved = await registerSubscription({
      userId,
      subscription,
      userAgent: req.headers["user-agent"] || "",
    });
    res.json({ message: "Subscription saved", id: saved._id });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to save subscription" });
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    await unregisterSubscription({ endpoint });
    res.json({ message: "Subscription removed" });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to remove subscription" });
  }
});

router.post("/test", async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;
    await sendPushToUser(userId, {
      title: title || "LMS Notification",
      body: body || "Test notification",
      url: url || "/",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
    res.json({ message: "Test push sent (if user has active subscription)." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to send test push" });
  }
});

module.exports = router;
