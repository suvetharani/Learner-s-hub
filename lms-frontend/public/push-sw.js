self.addEventListener("push", (event) => {
  if (!event.data) return;
  const payload = event.data.json();

  const title = payload.title || "LMS Notification";
  const options = {
    body: payload.body || "You have a new update.",
    icon: payload.icon || "/favicon.ico",
    badge: payload.badge || "/favicon.ico",
    data: {
      url: payload.url || "/",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";
  event.waitUntil(clients.openWindow(targetUrl));
});
