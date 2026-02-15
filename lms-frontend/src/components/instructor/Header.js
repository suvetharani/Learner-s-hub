import { useNavigate } from "react-router-dom";
import { FaRobot, FaBell, FaUserCircle, FaBars } from "react-icons/fa";

function Header({ setIsOpen }) {
  const navigate = useNavigate();

  return (
    <div className="header">
      {/* hamburger */}
      <FaBars className="hamburger" onClick={() => setIsOpen(true)} />

      {/* search */}
      <div className="search-box">
        <input placeholder="Search..." />
      </div>

      {/* icons */}
      <div className="header-icons">
        <FaRobot
          className="h-icon"
          onClick={() => navigate("/instructor/ai")}
        />

        <FaBell
          className="h-icon"
          onClick={() => navigate("/instructor/notifications")}
        />

        <FaUserCircle
          className="h-icon"
          onClick={() => navigate("/instructor/profile")}
        />
      </div>
    </div>
  );
}

export default Header;
