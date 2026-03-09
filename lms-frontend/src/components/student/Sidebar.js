import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import {
  FaBook,
  FaPlayCircle,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaEnvelope,
  FaStickyNote,
  FaTrophy,
  FaPlus,
} from "react-icons/fa";

const items = [
  { name: "academics", icon: <FaBook />, path: "/student/academics" },
  { name: "courses", icon: <FaPlayCircle />, path: "/student/courses" },
  { name: "instructors", icon: <FaChalkboardTeacher />, path: "/student/instructors" },
  { name: "classroom", icon: <FaDoorOpen />, path: "/student/classroom" },
  { name: "Take Test", icon: <FaBook />, path: "/student/tests" }, // ✅ FIXED
  { name: "messages", icon: <FaEnvelope />, path: "/student/messages" },
  { name: "notes", icon: <FaStickyNote />, hasAdd: true, path: "/student/notes" },
  { name: "ranking", icon: <FaTrophy />, path: "/student/ranking" },
  { name: "logout", icon: <FaDoorOpen /> },
];

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const popupRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  /* ================= SAVE NOTE TO BACKEND ================= */
  const handleSave = async () => {
    try {
      await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: title || "New Note",
          content: content || "",
        }),
      });

      setTitle("");
      setContent("");
      setShowPopup(false);

    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  /* ================= DRAG ================= */
  const handleMouseDown = (e) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - popupRef.current.offsetLeft,
      y: e.clientY - popupRef.current.offsetTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    popupRef.current.style.left = `${e.clientX - offset.current.x}px`;
    popupRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setIsOpen(false)}>
          ✕
        </div>

        <h2 className="logo">LMS</h2>

        {items.map((item) => (
          <div key={item.name} className="menu-item">
            <div
              className="menu-left"
onClick={() => {
  if (item.name === "logout") {
    localStorage.clear();
    navigate("/");
  } else if (item.path) {
    navigate(item.path);
  }

  setIsOpen(false);
}}
            >
              <span className="icon">{item.icon}</span>
              <span>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </span>
            </div>

            {/* PLUS BUTTON */}
            {item.hasAdd && (
              <FaPlus
                className="add-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPopup(true);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ================= QUICK NOTE POPUP ================= */}
      {showPopup && (
        <div
          ref={popupRef}
          className="quick-note-popup"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div className="popup-header" onMouseDown={handleMouseDown}>
            New Note
            <span onClick={() => setShowPopup(false)}>✕</span>
          </div>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </>
  );
}

export default Sidebar;