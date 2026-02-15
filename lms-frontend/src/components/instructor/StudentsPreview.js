import { Link } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

const students = [
  { name: "Arjun", roll: "21IT001", mobile: "9876543210" },
  { name: "Meena", roll: "21IT002", mobile: "9876543211" },
  { name: "Ravi", roll: "21IT003", mobile: "9876543212" },
  { name: "Divya", roll: "21IT004", mobile: "9876543213" },
  { name: "Karthik", roll: "21IT005", mobile: "9876543214" },
];

function StudentsPreview() {
  const preview = students.slice(0, 3); // show only few

  return (
    <div className="box">
      <div className="box-header">
        <h4>Students</h4>
        
      </div>

      {preview.map((s) => (
        <div key={s.roll} className="student-row">
          <div>
            <div className="student-name">{s.name}</div>
            <div className="student-sub">
              Roll: {s.roll} | {s.mobile}
            </div>
          </div>

          <FaEnvelope className="message-icon" />
        </div>
      ))}
      <Link to="/instructor/students" className="view-all">
          View All
        </Link>
    </div>
  );
}

export default StudentsPreview;
