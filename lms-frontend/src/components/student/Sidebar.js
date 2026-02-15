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
  { name: "academics", icon: <FaBook /> },
  { name: "courses", icon: <FaPlayCircle /> },
  { name: "instructors", icon: <FaChalkboardTeacher /> },
  { name: "classroom", icon: <FaDoorOpen /> },
  { name: "messages", icon: <FaEnvelope /> },
  { name: "notes", icon: <FaStickyNote />, hasAdd: true },
  { name: "ranking", icon: <FaTrophy /> },
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

  /* ================= SAVE NOTE ================= */
  const handleSave = () => {
    const oldNotes = JSON.parse(localStorage.getItem("notes")) || [];

    oldNotes.push({
      id: Date.now(),
      title,
      content,
    });

    localStorage.setItem("notes", JSON.stringify(oldNotes));

    setTitle("");
    setContent("");
    setShowPopup(false);
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
                  // ✅ logout logic
                  localStorage.clear();
                  navigate("/");
                } else {
                  navigate(`/student/${item.name}`);
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
