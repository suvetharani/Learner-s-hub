import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = `${process.env.REACT_APP_API_URL}`;
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export default function GlobalNotificationListener() {
  const location = useLocation();
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());
  const audioCtxRef = useRef(null);
  const swRegRef = useRef(null);

  const playNotificationSound = async () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.13, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // mobile/desktop autoplay policy can block until interaction
    }
  };

  const showInAppToast = (text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text }].slice(-3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const showSystemNotification = async (text) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    if (swRegRef.current) {
      await swRegRef.current.showNotification("LMS Notification", {
        body: text,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        data: { url: window.location.href },
      });
      return;
    }

    new Notification("LMS Notification", { body: text, icon: "/favicon.ico" });
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    if (!role || !userId) return;

    let mounted = true;
    let intervalId = null;

    const unlockAudio = () => {
      playNotificationSound();
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
    document.addEventListener("pointerdown", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });

    const registerServiceWorkerAndPush = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.register("/push-sw.js");
          swRegRef.current = reg;
        }

        if ("Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission();
        }

        if (
          swRegRef.current &&
          "pushManager" in swRegRef.current &&
          Notification.permission === "granted" &&
          VAPID_PUBLIC_KEY
        ) {
          const existing = await swRegRef.current.pushManager.getSubscription();
          const subscription =
            existing ||
            (await swRegRef.current.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            }));

          await fetch(`${API_BASE}/api/push/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, subscription }),
          });
        }
      } catch {
        // keep app functional even if push setup fails
      }
    };

    const endpoint =
      role === "admin"
        ? `${API_BASE}/api/users/notifications/instructor/${userId}`
        : `${API_BASE}/api/users/notifications/student/${userId}`;

    const poll = async (initial = false) => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!mounted || !res.ok || !Array.isArray(data)) return;

        const currentIds = new Set(data.map((n) => n._id || `${n.type}-${n.text}-${n.createdAt}`));
        if (initial) {
          seenIdsRef.current = currentIds;
          return;
        }

        data.forEach((n) => {
          const id = n._id || `${n.type}-${n.text}-${n.createdAt}`;
          if (seenIdsRef.current.has(id)) return;

          seenIdsRef.current.add(id);
          showInAppToast(n.text);
          showSystemNotification(n.text);
          playNotificationSound();
        });
      } catch {
        // ignore transient network issues
      }
    };

    registerServiceWorkerAndPush();
    poll(true);
    intervalId = setInterval(() => poll(false), 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, [location.pathname]);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#1f2937",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 12px",
            maxWidth: 320,
            boxShadow: "0 6px 18px rgba(0,0,0,0.24)",
            fontSize: 14,
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
