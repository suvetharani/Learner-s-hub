import { useState } from "react";
import "../../styles/student/academics.css";


const semesters = [
  {
    sem: "Semester 1",
    courses: [
      { name: "Maths I", progress: 70 },
      { name: "Physics", progress: 40 },
      { name: "C Programming", progress: 80 },
      { name: "Basic Electrical", progress: 55 },
      { name: "Engineering Graphics", progress: 30 },
    ],
  },
  {
    sem: "Semester 2",
    courses: [
      { name: "Maths II", progress: 60 },
      { name: "Chemistry", progress: 75 },
      { name: "Data Structures", progress: 50 },
      { name: "Digital Logic", progress: 20 },
      { name: "Environmental Studies", progress: 90 },
    ],
  },
  { sem: "Semester 3", courses: [] },
  { sem: "Semester 4", courses: [] },
  { sem: "Semester 5", courses: [] },
  { sem: "Semester 6", courses: [] },
  { sem: "Semester 7", courses: [] },
  { sem: "Semester 8", courses: [] },
];

export default function Academics() {
  // store which semesters are open
  const [openSem, setOpenSem] = useState({});

  const toggleSemester = (index) => {
    setOpenSem((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="academics">
      {semesters.map((s, index) => (
        <div key={index} className="semester">
          
          {/* TITLE ROW */}
          <div
            className="semester-header"
            onClick={() => toggleSemester(index)}
          >
            <h3>{s.sem}</h3>
            <span className={`toggle ${openSem[index] ? "open" : ""}`}>
              ▼
            </span>
          </div>

          {/* COURSES */}
          {openSem[index] && (
            <div className="courses">
              {s.courses.length === 0 ? (
                <p className="empty">Courses will be updated soon.</p>
              ) : (
                s.courses.map((c, i) => (
                  <div key={c.name} className={`course-card color-${i % 4}`}>

                    <div className="course-head">
                      <h4>{c.name}</h4>
                      <div className="arrow">→</div>
                    </div>

                    <p className="progress-text">{c.progress}% completed</p>

                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
