import { FaArrowRight } from "react-icons/fa";

const courses = [
  { name: "MERN Stack", progress: 70, color: "#E8F9FF" },
  { name: "Operating System", progress: 45, color: "#FFF4E6" },
  { name: "Computer Networks", progress: 80, color: "#EAF7E6" },
  { name: "MERN Stack", progress: 70, color: "#E8F9FF" },
  { name: "Operating System", progress: 45, color: "#FFF4E6" },
  { name: "Computer Networks", progress: 80, color: "#EAF7E6" },
  { name: "MERN Stack", progress: 70, color: "#E8F9FF" },
  { name: "Operating System", progress: 45, color: "#FFF4E6" },
  { name: "Computer Networks", progress: 80, color: "#EAF7E6" }
];

function CurrentCourses() {
  return (
    <div className="course-list">
      {courses.map((c) => (
        <div
          key={c.name}
          className="course-card"
          style={{ background: c.color }}
        >
          {/* top row */}
          <div className="course-top">
            <h4>{c.name}</h4>

            <div className="go-icon">
              <FaArrowRight />
            </div>
          </div>

          {/* progress */}
          <p className="progress-text">{c.progress}% completed</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${c.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CurrentCourses;
