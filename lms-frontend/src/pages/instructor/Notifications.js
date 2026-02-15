import "../../styles/student/notifications.css";
import { FaBell, FaBook, FaClipboardList } from "react-icons/fa";

const notifications = [
  {
    type: "assignment",
    text: "New assignment uploaded for Data Structures.",
    time: "2 hours ago",
    unread: true,
  },
  {
    type: "material",
    text: "AI Unit 2 notes are available in classroom.",
    time: "Yesterday",
    unread: false,
  },
  {
    type: "general",
    text: "Mid semester exams start from March 10.",
    time: "2 days ago",
    unread: false,
  },
];

export default function Notifications() {
  return (
    <div className="notifications-page">
      <h2>🔔 Notifications</h2>

      {notifications.length === 0 ? (
        <p className="empty">No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n, i) => (
            <div
              key={i}
              className={`notification-card ${n.unread ? "unread" : ""}`}
            >
              <div className="icon">
                {n.type === "assignment" && <FaClipboardList />}
                {n.type === "material" && <FaBook />}
                {n.type === "general" && <FaBell />}
              </div>

              <div className="content">
                <p>{n.text}</p>
                <span>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
