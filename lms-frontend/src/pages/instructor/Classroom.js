import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/instructor/classroom.css";

export default function Classroom() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Decode user from token
  const getUserFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
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

  // 🔥 DELETE COURSE FUNCTION
  const deleteCourse = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Course deleted successfully!");

        // 🔥 Remove from UI without refresh
        setCourses((prev) =>
          prev.filter((course) => course._id !== courseId)
        );
      } else {
        alert(data.message || "Failed to delete course");
      }
    } catch (err) {
      console.log(err);
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
            <div key={course._id} className="course-card">
              {/* 🔥 OPEN COURSE */}
              <div
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

              {/* 🔥 DELETE BUTTON (ONLY OWNER) */}
              {isOwner && (
                <button
                  className="delete-btn"
                  onClick={() => deleteCourse(course._id)}
                >
                  Delete Course
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}