// src/pages/instructor/StudentDetails.js
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

// dummy data for demonstration
const studentData = [
  {
    id: "1",
    name: "Arjun",
    roll: "IT2023001",
    email: "arjun@example.com",
    mobile: "9876543210",
    courses: [
      { name: "Maths I", progress: 70 },
      { name: "Physics", progress: 45 },
    ],
  },
  {
    id: "2",
    name: "Meena",
    roll: "IT2023002",
    email: "meena@example.com",
    mobile: "9123456780",
    courses: [
      { name: "C Programming", progress: 80 },
      { name: "Maths I", progress: 60 },
    ],
  },
];

function StudentDetails() {
  const { id } = useParams(); // get student id from URL
  const [student, setStudent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const s = studentData.find((stu) => stu.id === id);
    setStudent(s);
  }, [id]);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="student-layout">
      <div className="main">

        <div style={{ padding: "20px" }}>
          <h2>{student.name}</h2>
          <p><strong>Roll Number:</strong> {student.roll}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Mobile:</strong> {student.mobile}</p>

          <h3>Courses & Progress</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {student.courses.map((c) => (
              <div key={c.name} style={{ background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #eee" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{c.name}</span>
                  <span>{c.progress}%</span>
                </div>
                <div style={{ height: "8px", background: "#ddd", borderRadius: "6px", marginTop: "6px" }}>
                  <div style={{ width: `${c.progress}%`, background: "#4f46e5", height: "100%", borderRadius: "6px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;
