import { useEffect, useState } from "react";
import "../../styles/student/notifications.css";
import { FaBell, FaBook, FaClipboardList, FaEnvelope } from "react-icons/fa";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${Math.max(min, 1)} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d > 1 ? "s" : ""} ago`;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/notifications/student/${userId}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setNotifications(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [userId]);

  return (
    <div className="notifications-page">
      <h2>🔔 Notifications</h2>

      {loading ? (
        <p className="empty">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="empty">No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="notification-card unread"
            >
              <div className="icon">
                {n.type === "test" && <FaClipboardList />}
                {n.type === "classroom" && <FaBook />}
                {n.type === "message" && <FaEnvelope />}
                {n.type === "general" && <FaBell />}
              </div>

              <div className="content">
                <p>{n.text}</p>
                <span>{timeAgo(n.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
