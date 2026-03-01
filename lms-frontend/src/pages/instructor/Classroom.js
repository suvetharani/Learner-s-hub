import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/instructor/classroom.css";

export default function Classroom() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🔥 Decode user directly from token
  const getUserFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload; // contains id or _id depending on your JWT
    } catch (err) {
      return null;
    }
  };

  const currentUser = getUserFromToken();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses");
      const data = await res.json();
      if (res.ok) {
        setCourses(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <div className="classroom-page">
      <h2>Instructor Classroom</h2>

      <div className="course-grid">
        {courses.map((course) => {
          const isOwner =
            course.instructor?._id === currentUser?.id ||
            course.instructor?._id === currentUser?._id;

          return (
            <div
              key={course._id}
              className="course-card"
              onClick={() =>
                navigate(`/instructor/course/${course._id}`, {
                  state: { isOwner },
                })
              }
            >
              <h3>{course.name}</h3>

              <p className="course-author">
                Author: {course.instructor?.name}
              </p>

              {isOwner ? (
                <span className="badge-own">Your Course</span>
              ) : (
                <span className="badge-view">View Only</span>
              )}

              <p className="open-text">Click to open</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}