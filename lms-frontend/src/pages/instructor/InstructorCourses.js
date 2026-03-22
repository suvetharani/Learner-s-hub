import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { domainConfig } from "../../config/domainConfig";
import "../../styles/student/courses.css";

export default function InstructorCourses() {
  const navigate = useNavigate();
  const [openDomain, setOpenDomain] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [domains] = useState(domainConfig);

  const getCourseById = (courseId) => {
    for (const domain of domains) {
      const found = domain.courses.find((c) => c.id === courseId);
      if (found) return found;
    }
    return null;
  };

  const toggleDomain = (index) => {
    setOpenDomain((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openCourseContents = (course, domainTitle) => {
    setSelectedCourse({
      id: course.id,
      name: course.name,
      domain: domainTitle,
      points: course.points || 0,
      topics: course.topics || [],
    });
  };

  const handleTopicClick = (courseId, topic) => {
    if (!topic?.filePath) return;
    const encodedPath = encodeURIComponent(topic.filePath || "");
    navigate(
      `/instructor/courses/topic/${courseId}/${topic.id}?file=${encodedPath}&title=${encodeURIComponent(topic.title || "")}`,
      { state: { topicTitle: topic.title, filePath: topic.filePath } }
    );
  };

  return (
    <div className="basic-courses">
      <div className="courses-header">
        <h2>Course Materials</h2>
        <p>
          Manage course content. Expand a domain, select a course, and add
          images or videos (up to 5 mins) to each topic.
        </p>
      </div>

      <div className="courses-layout">
        <div className="domains-column">
          {domains.map((d, index) => (
            <div key={index} className="domain">
              <div
                className="domain-header"
                onClick={() => toggleDomain(index)}
              >
                <h3>{d.title}</h3>
                <span className={`toggle ${openDomain[index] ? "open" : ""}`}>
                  ▼
                </span>
              </div>

              {openDomain[index] && (
                <div className="courses">
                  {d.courses.length === 0 ? (
                    <p className="empty">Courses will be updated soon.</p>
                  ) : (
                    d.courses.map((c, i) => (
                      <div
                        key={c.id}
                        className={`course-card color-${i % 4}`}
                        onClick={() => openCourseContents(c, d.title)}
                      >
                        <div className="course-head">
                          <h4>{c.name}</h4>
                          <div className="arrow">→</div>
                        </div>
                        {c.topics?.length > 0 ? (
                          <p className="progress-text">
                            {c.topics.length} topics • {c.points || 0}pts
                          </p>
                        ) : (
                          <p className="progress-text">
                            Topics will be added soon.
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="contents-column">
          {selectedCourse ? (
            <div className="contents-card">
              <h3>{selectedCourse.name}</h3>
              <p className="contents-subtitle">
                Domain: {selectedCourse.domain} • {selectedCourse.points || 0}pts
              </p>

              {selectedCourse.topics.length === 0 ? (
                <p className="empty">Contents will be added soon.</p>
              ) : (
                <ul className="contents-list">
                  {selectedCourse.topics.map((topic) => (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() =>
                          handleTopicClick(selectedCourse.id, topic)
                        }
                      >
                        {topic.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="contents-card contents-placeholder">
              <h3>Course contents</h3>
              <p>Select a course on the left to view and manage topics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
