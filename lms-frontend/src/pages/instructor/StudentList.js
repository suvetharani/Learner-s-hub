import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import "../../styles/instructor/studentlist.css";

function StudentList() {
  const navigate = useNavigate();
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);

  const token = localStorage.getItem("token");

  // Fetch students
  const fetchStudents = async () => {
    try {
      const approvedRes = await fetch(
        "http://localhost:5000/api/users/students/approved",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const pendingRes = await fetch(
        "http://localhost:5000/api/users/students/pending",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const approvedData = await approvedRes.json();
      const pendingData = await pendingRes.json();

      setApprovedStudents(approvedData);
      setPendingStudents(pendingData);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Approve function
  const approveStudent = async (id) => {
    await fetch(
      `http://localhost:5000/api/users/students/approve/${id}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchStudents(); // refresh list
  };

  return (
    <div className="student-box">
      <h4>Approved Students</h4>

      <div className="student-table">
        <div className="student-header">
          <span>Name</span>
          <span>Email</span>
          <span>Roll Number</span>
          <span>Message</span>
        </div>

        {approvedStudents.map((s) => (
          <div key={s._id} className="student-row">
            <span
              className="student-name clickable"
              onClick={() => navigate(`/instructor/students/${s._id}`)}
            >
              {s.name}
            </span>
            
            <span>{s.email}</span>
            <span>{s.rollNumber}</span>
<span
  className="message-icon clickable"
  onClick={() => navigate(`/instructor/messages/${s._id}`)}
>
  <FaEnvelope />
</span>
          </div>
        ))}
      </div>

      {/* Pending Approval Box */}
      <div className="pending-box">
        <h4>Students Waiting For Approval</h4>

        {pendingStudents.length === 0 ? (
          <p>No pending students</p>
        ) : (
          pendingStudents.map((s) => (
            <div key={s._id} className="pending-row">
              <span>{s.name}</span>
              <span
  className="student-email clickable"
  onClick={() => window.location.href = `mailto:${s.email}`}
>
  {s.email}
</span>
              <span>{s.rollNumber}</span>
              <button onClick={() => approveStudent(s._id)}>
                Approve
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentList;