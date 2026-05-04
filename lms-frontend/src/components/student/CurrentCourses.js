import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const RECENT_COURSES_KEY = "recentCourses";

const colors = ["#E8F9FF", "#FFF4E6", "#EAF7E6", "#F3E8FF"];

// Static course structure used by Courses.js - to resolve course by id
const domainConfig = [
  { title: "Artificial Intelligence", courses: [
    { id: "intro-ai", name: "Introduction to AI", points: 10, topics: [
      { id: "whatisai", title: "What is AI?", filePath: "/courses/ArtificialIntelligence/whatisAI.txt" },
      { id: "History of AI", title: "History Of AI", filePath: "/courses/ArtificialIntelligence/History of AI.txt" },
      { id: "ai-applications", title: "AI Applications", filePath: "/courses/ArtificialIntelligence/aiApplications.txt" },
      
    ]},
    { id: "ml-basics", name: "Machine Learning Basics", points: 5, topics: [] },
    { id: "nn-basics", name: "Neural Networks", points: 5, topics: [] },
  ]},
  { title: "Cybersecurity", courses: [
    { id: "network-security", name: "Network Security", points: 10, topics: [
      { id: "what-is-threats", title: "What are Threats?", filePath: "/courses/cybersecurity/whatisthreats.txt" },
    ]},
    { id: "ethical-hacking", name: "Ethical Hacking", points: 5, topics: [] },
    { id: "cryptography", name: "Cryptography", points: 5, topics: [] },
  ]},
  { title: "Web Development", courses: [
    { id: "html-css", name: "HTML & CSS", points: 5, topics: [] },
    { id: "javascript", name: "JavaScript", points: 5, topics: [] },
    { id: "react-basics", name: "React Basics", points: 5, topics: [] },
  ]},
  { title: "App Development", courses: [
    { id: "flutter-basics", name: "Flutter Basics", points: 5, topics: [] },
    { id: "firebase", name: "Firebase", points: 5, topics: [] },
  ]},
  { title: "Cloud Computing", courses: [] },
];

function getCourseById(courseId) {
  for (const domain of domainConfig) {
    const found = domain.courses.find((c) => c.id === courseId);
    if (found) return { course: found, domainTitle: domain.title };
  }
  return null;
}

function CurrentCourses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const loadCourses = () => {
    try {
      const userId = localStorage.getItem("userId");
      const key = `${RECENT_COURSES_KEY}:${userId || "guest"}`;
      const raw = localStorage.getItem(key);
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

  const loadCoursesFromBackend = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/recent-courses/${userId}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setCourses(data);
      }
    } catch {
      // ignore backend failures and keep local data
    }
  };

  useEffect(() => {
    loadCourses();
    loadCoursesFromBackend();

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

        const handleGoToCourse = () => {
          const resolved = getCourseById(c.id);
          if (resolved) {
            navigate("/student/courses", {
              state: {
                openCourseId: c.id,
                openDomainTitle: resolved.domainTitle,
                openCourse: {
                  id: resolved.course.id,
                  name: resolved.course.name,
                  domain: resolved.domainTitle,
                  points: resolved.course.points || 0,
                  topics: resolved.course.topics || [],
                },
              },
            });
          } else {
            navigate("/student/courses");
          }
        };

        return (
          <div
            key={c.id || `${c.name}-${index}`}
            className="course-card"
            style={{ background: color }}
          >
            <div className="course-top">
              <h4>{c.name}</h4>

              <div className="go-icon" onClick={handleGoToCourse} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleGoToCourse()} aria-label={`Open ${c.name}`}>
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
