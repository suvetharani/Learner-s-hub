const webpush = require("web-push");
const PushSubscription = require("../models/PushSubscription");

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const contact = process.env.VAPID_CONTACT || "mailto:admin@example.com";

const isConfigured = Boolean(publicKey && privateKey);

if (isConfigured) {
  webpush.setVapidDetails(contact, publicKey, privateKey);
}

const registerSubscription = async ({ userId, subscription, userAgent = "" }) => {
  if (!userId || !subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error("Invalid subscription payload");
  }

  return PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      userId,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      userAgent,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const unregisterSubscription = async ({ endpoint }) => {
  if (!endpoint) return;
  await PushSubscription.deleteOne({ endpoint });
};

const sendPushToUser = async (userId, payload) => {
  if (!isConfigured || !userId) return;

  const subscriptions = await PushSubscription.find({ userId }).lean();
  if (!subscriptions.length) return;

  const message = JSON.stringify(payload || {});
  await Promise.all(
    subscriptions.map(async (sub) => {
      const subscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };
      try {
        await webpush.sendNotification(subscription, message);
      } catch (err) {
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await PushSubscription.deleteOne({ endpoint: sub.endpoint });
        }
      }
    })
  );
};

module.exports = {
  isPushConfigured: isConfigured,
  publicKey,
  registerSubscription,
  unregisterSubscription,
  sendPushToUser,
};
