import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/instructor/studentprofile.css";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const res = await fetch(
        `http://localhost:5000/api/users/profile/${id}`
      );
      const data = await res.json();
      setStudent(data);
    };

    fetchStudent();
  }, [id]);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="student-profile-page">
      <div className="student-profile-card">

        <img
          src={
            student.profileImage
              ? `http://localhost:5000/${student.profileImage}`
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="profile"
        />

        <h3>{student.name}</h3>

        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Roll Number:</strong> {student.rollNumber}</p>

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          {/* EMAIL BUTTON */}
          <a 
            href={`mailto:${student.email}`} 
            className="action-btn"
          >
            📧 Email
          </a>

          {/* MESSAGE BUTTON */}
          <button
            className="action-btn"
            onClick={() => navigate("/instructor/messages")}
          >
            💬 Message
          </button>
        </div>

      </div>
    </div>
  );
}