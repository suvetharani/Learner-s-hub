import { useState } from "react";
import "../../styles/student/courses.css";

const domains = [
  {
    title: "Artificial Intelligence",
    courses: [
      { name: "Introduction to AI", progress: 70 },
      { name: "Machine Learning Basics", progress: 40 },
      { name: "Neural Networks", progress: 20 },
    ],
  },
  {
    title: "Cybersecurity",
    courses: [
      { name: "Network Security", progress: 60 },
      { name: "Ethical Hacking", progress: 30 },
      { name: "Cryptography", progress: 80 },
    ],
  },
  {
    title: "Web Development",
    courses: [
      { name: "HTML & CSS", progress: 90 },
      { name: "JavaScript", progress: 75 },
      { name: "React Basics", progress: 50 },
    ],
  },
  {
    title: "App Development",
    courses: [
      { name: "Flutter Basics", progress: 65 },
      { name: "Firebase", progress: 40 },
    ],
  },
  {
    title: "Cloud Computing",
    courses: [],
  },
];

export default function BasicComputerCourses() {
  const [openDomain, setOpenDomain] = useState({});

  const toggleDomain = (index) => {
    setOpenDomain((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="basic-courses">
      {domains.map((d, index) => (
        <div key={index} className="domain">
          
          {/* HEADER */}
          <div
            className="domain-header"
            onClick={() => toggleDomain(index)}
          >
            <h3>{d.title}</h3>
            <span className={`toggle ${openDomain[index] ? "open" : ""}`}>
              ▼
            </span>
          </div>

          {/* COURSES */}
          {openDomain[index] && (
            <div className="courses">
              {d.courses.length === 0 ? (
                <p className="empty">Courses will be updated soon.</p>
              ) : (
                d.courses.map((c, i) => (
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
