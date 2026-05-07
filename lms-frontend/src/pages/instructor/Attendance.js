import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/instructor/attendance.css";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/students/approved", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
          setStudents(Array.isArray(data) ? data : []);
        } else {
          setStudents([]);
        }
      } catch {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  return (
    <div className="attendance-box">
      <h4>Attendance</h4>

      {loading ? (
        <p>Loading attendance...</p>
      ) : students.length === 0 ? (
        <p>No students available.</p>
      ) : (
        <div className="attendance-list">
          {students.map((student) => (
            <div key={student._id} className="attendance-row">
              <div className="attendance-student">
                <button
                  type="button"
                  className="attendance-name-btn"
                  onClick={() => navigate(`/instructor/attendance/${student._id}`)}
                >
                  {student.name}
                </button>
              </div>
              <div className="attendance-meta">
                <span>{student.rollNumber || "-"}</span>
                <span>{student.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Attendance;
