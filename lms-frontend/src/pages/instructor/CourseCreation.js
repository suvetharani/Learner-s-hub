import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/instructor/classroom.css";

export default function CourseCreation() {
  const [courseName, setCourseName] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleCreateCourse = async () => {
    if (!courseName) return alert("Enter course name");

    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: courseName }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Course created successfully");
        navigate("/instructor/classroom"); // 🔥 redirect
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="classroom-page">
      <h2>Create New Course</h2>

      <div className="create-course">
        <input
          type="text"
          placeholder="Enter course name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <button onClick={handleCreateCourse}>
          Create Course
        </button>
      </div>
    </div>
  );
}