import Sidebar from "../instructor/Sidebar";
import Header from "../instructor/Header";
import "../../styles/instructor/instructor.css";

function InstructorLayout({ children, isOpen, setIsOpen }) {
  return (
    <div className="instructor-layout">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* MAIN */}
      <div className="main">
        {children}
      </div>
    </div>
  );
}

export default InstructorLayout;
