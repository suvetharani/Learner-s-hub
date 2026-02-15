import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ⭐ add this
import { FaRobot, FaBell, FaUserCircle, FaBars } from "react-icons/fa";
import Chatbot from "./Chatbot";

function Header({ setIsOpen }) {
  const [openBot, setOpenBot] = useState(false);
  const navigate = useNavigate();   // ⭐ create navigator

  return (
    <>
      <div className="header">
        {/* hamburger */}
        <FaBars className="hamburger" onClick={() => setIsOpen(true)} />

        {/* search */}
        <div className="search-box">
          <input placeholder="Search..." />
        </div>

        {/* icons */}
        <div className="header-icons">
          <FaRobot className="h-icon" onClick={() => setOpenBot(true)} />

          {/* 🔔 navigate */}
          <FaBell
            className="h-icon"
            onClick={() => navigate("/student/notifications")}
          />

          <FaUserCircle
            className="h-icon"
            onClick={() => navigate("/student/profile")}
          />
        </div>
      </div>

      {/* CHATBOT POPUP */}
      {openBot && <Chatbot onClose={() => setOpenBot(false)} />}
    </>
  );
}

export default Header;
