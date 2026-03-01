import { useEffect, useState } from "react";
import "../../styles/student/classroom.css";
import { useNavigate } from "react-router-dom";

export default function Classroom() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/student", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setCourses(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const requestToJoin = async (courseId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${courseId}/request`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Request sent successfully!");
        fetchCourses(); // refresh
        setSelectedCourse(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="classroom-page">
      <h2>Available Courses</h2>

      <div className="batch-grid">
        {courses.map((course) => (
          <div
            key={course._id}
            className="batch-card"
            onClick={() => setSelectedCourse(course)}
          >
            <h3>{course.name}</h3>
            <p>Instructor: {course.instructor?.name}</p>

            {/* STATUS BADGE */}
            {course.isEnrolled && (
              <span className="badge enrolled">Enrolled</span>
            )}

            {!course.isEnrolled && course.isRequested && (
              <span className="badge pending">Pending Approval</span>
            )}
          </div>
        ))}
      </div>

      {/* POPUP */}
      {selectedCourse && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{selectedCourse.name}</h3>
            <p>Instructor: {selectedCourse.instructor?.name}</p>

            <div className="modal-buttons">

              {/* ENROLLED */}
              {selectedCourse.isEnrolled ? (
                <button
                  className="btn-enroll"
                  onClick={() =>
                    navigate(`/student/course/${selectedCourse._id}`)
                  }
                >
                  Open Course
                </button>
              ) : selectedCourse.isRequested ? (
                /* REQUESTED */
                <button className="btn-disabled" disabled>
                  Pending Approval
                </button>
              ) : (
                /* NOT REQUESTED */
                <button
                  className="btn-enroll"
                  onClick={() => requestToJoin(selectedCourse._id)}
                >
                  Request Enroll
                </button>
              )}

              <button
                className="btn-cancel"
                onClick={() => setSelectedCourse(null)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}