import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const RECENT_COURSES_KEY = "recentCourses";

const colors = ["#E8F9FF", "#FFF4E6", "#EAF7E6", "#F3E8FF"];

function CurrentCourses() {
  const [courses, setCourses] = useState([]);

  const loadCourses = () => {
    try {
      const raw = localStorage.getItem(RECENT_COURSES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (Array.isArray(list)) {
        setCourses(list);
      } else {
        setCourses([]);
      }
    } catch {
      setCourses([]);
    }
  };

  useEffect(() => {
    loadCourses();

    const handler = () => loadCourses();
    window.addEventListener("recentCoursesUpdated", handler);

    return () => {
      window.removeEventListener("recentCoursesUpdated", handler);
    };
  }, []);

  if (!courses.length) {
    return (
      <div className="course-list">
        <p className="empty">Start exploring courses to see them here.</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      {courses.map((c, index) => {
        const color = colors[index % colors.length];
        const safeProgress =
          typeof c.progress === "number" && c.progress >= 0 && c.progress <= 100
            ? c.progress
            : 0;

        return (
          <div
            key={c.id || `${c.name}-${index}`}
            className="course-card"
            style={{ background: color }}
          >
            <div className="course-top">
              <h4>{c.name}</h4>

              <div className="go-icon">
                <FaArrowRight />
              </div>
            </div>

            <p className="progress-text">
              {safeProgress}% completed
              {c.domain ? ` • ${c.domain}` : ""}
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CurrentCourses;
