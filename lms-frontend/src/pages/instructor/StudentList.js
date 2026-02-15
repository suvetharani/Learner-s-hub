import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import "../../styles/instructor/studentlist.css";

const students = [
  { id: 1, name: "Arjun", email: "arjun@example.com", roll: "IT101", mobile: "9876543210" },
  { id: 2, name: "Meena", email: "meena@example.com", roll: "IT102", mobile: "9876501234" },
  { id: 3, name: "Ravi", email: "ravi@example.com", roll: "IT103", mobile: "9876540000" },
  { id: 4, name: "Sita", email: "sita@example.com", roll: "IT104", mobile: "9876541122" },
  { id: 5, name: "Rahul", email: "rahul@example.com", roll: "IT105", mobile: "9876543344" },
  // ... add more students
];

function StudentList() {
  const navigate = useNavigate();

  return (
    <div className="student-box">
      <h4>Students</h4>

      <div className="student-table">
        {/* Header */}
        <div className="student-header">
          <span>Name</span>
          <span>Email</span>
          <span>Roll No</span>
          <span>Mobile</span>
          <span>Message</span>
        </div>

        {/* Rows */}
        {students.map((s) => (
          <div key={s.id} className="student-row">
            <span
              className="student-name clickable"
              onClick={() => navigate(`/instructor/students/${s.id}`)}
            >
              {s.name}
            </span>
            <span>{s.email}</span>
            <span>{s.roll}</span>
            <span>{s.mobile}</span>
            <span className="message-icon">
              <FaEnvelope />
            </span>
          </div>
        ))}
      </div>

      <button className="view-all" onClick={() => alert("View all clicked")}>
        View All
      </button>
    </div>
  );
}

export default StudentList;
