import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { domainConfig } from "../../config/domainConfig";
import "../../styles/student/courses.css";

const RECENT_COURSES_KEY = "recentCourses";

export default function BasicComputerCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const [openDomain, setOpenDomain] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [domains] = useState(domainConfig);

  // Open course when navigating from CurrentCourses arrow
  useEffect(() => {
    const state = location.state;
    if (state?.openCourse && state?.openDomainTitle) {
      setSelectedCourse(state.openCourse);
      const domainIndex = domainConfig.findIndex((d) => d.title === state.openDomainTitle);
      if (domainIndex >= 0) {
        setOpenDomain((prev) => ({ ...prev, [domainIndex]: true }));
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openCourseId]);
  const [readTopicIds, setReadTopicIds] = useState([]);
  const [completedCourseIds, setCompletedCourseIds] = useState([]);

  const recentCoursesKey = useMemo(
    () => `${RECENT_COURSES_KEY}:${userId || "guest"}`,
    [userId]
  );

  useEffect(() => {
    if (!userId) return;
    const loadProgress = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/course-progress/${userId}`
        );
        const data = await res.json();
        if (res.ok) {
          setReadTopicIds(data.readTopicIds || []);
          setCompletedCourseIds(data.completedCourseIds || []);
        }
      } catch {
        // ignore errors and keep default states
      }
    };
    loadProgress();
  }, [userId]);

  const getCourseById = (courseId) => {
    for (const domain of domains) {
      const found = domain.courses.find((c) => c.id === courseId);
      if (found) return found;
    }
    return null;
  };

  const toggleDomain = (index) => {
    setOpenDomain((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const openCourseContents = (course, domainTitle) => {
    const coursePayload = {
      id: course.id,
      name: course.name,
      domain: domainTitle,
      points: course.points || 0,
      topics: course.topics || [],
    };

    setSelectedCourse(coursePayload);

    // compute progress for this course so CurrentCourses can display it
    const progress = computeCourseProgress(course);

    // persist to "recent courses" so CurrentCourses can read it
    try {
      const raw = localStorage.getItem(recentCoursesKey);
      const list = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(list) ? [...list] : [];

      const idx = updated.findIndex((c) => c.id === course.id);
      const entry = {
        id: course.id,
        name: course.name,
        domain: domainTitle,
        progress,
        points: course.points || 0,
        lastAccessed: new Date().toISOString(),
      };

      if (idx >= 0) {
        updated[idx] = entry;
      } else {
        updated.unshift(entry);
      }

      const finalList = updated.slice(0, 10);
      localStorage.setItem(recentCoursesKey, JSON.stringify(finalList));

      // notify other components (like CurrentCourses) inside this tab
      window.dispatchEvent(new Event("recentCoursesUpdated"));

      if (userId) {
        fetch("http://localhost:5000/api/users/recent-courses/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, course: entry })
        }).catch(() => {
          // ignore backend sync errors
        });
      }
    } catch {
      // ignore storage errors
    }

  };

  const computeCourseProgress = (course) => {
    const totalTopics = course.topics?.length || 0;
    if (totalTopics === 0) return 0;
    const readCount = course.topics.filter((t) =>
      readTopicIds.includes(`${course.id}:${t.id}`)
    ).length;
    return Math.round((readCount / totalTopics) * 100);
  };

  const handleTopicClick = async (courseId, topic) => {
    if (!topic?.filePath) return;
    const course = getCourseById(courseId);

    const key = `${courseId}:${topic.id}`;
    const willAddNew = !readTopicIds.includes(key);
    const nextReadTopicIds = willAddNew ? [...readTopicIds, key] : readTopicIds;
    setReadTopicIds(nextReadTopicIds);

    if (course?.topics?.length && userId) {
      const readCount = course.topics.filter((t) =>
        nextReadTopicIds.includes(`${course.id}:${t.id}`)
      ).length;
      const isCompletedNow = readCount === course.topics.length;

      try {
        const res = await fetch("http://localhost:5000/api/users/course-progress/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            courseId,
            topicId: topic.id,
            coursePoints: course.points || 0,
            completed: isCompletedNow,
          })
        });
        const data = await res.json();
        if (res.ok) {
          setReadTopicIds(data.learning?.readTopicIds || nextReadTopicIds);
          setCompletedCourseIds(data.learning?.completedCourseIds || []);
        }
      } catch {
        // ignore and proceed to topic page
      }
    }

    const encodedPath = encodeURIComponent(topic.filePath || "");
    navigate(
      `/student/courses/topic/${courseId}/${topic.id}?file=${encodedPath}&title=${encodeURIComponent(topic.title || "")}`,
      {
        state: {
          topicTitle: topic.title,
          filePath: topic.filePath,
        },
      }
    );
  };

  return (
    <div className="basic-courses">
      <div className="courses-header">
        <h2>Explore Courses</h2>
        <p>
          Expand a domain, pick a course to see its contents, and open full
          tutorials while keeping your progress tracking.
        </p>
      </div>

      <div className="courses-layout">
        <div className="domains-column">
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
                    d.courses.map((c, i) => {
                      const progress = computeCourseProgress(c);
                      return (
                        <div
                          key={c.id}
                          className={`course-card color-${i % 4}`}
                          onClick={() => openCourseContents(c, d.title)}
                        >
                        <div className="course-head">
                          <h4>{c.name}</h4>
                          <div className="arrow">→</div>
                        </div>

                        {c.topics && c.topics.length > 0 ? (
                          <>
                            <p className="progress-text">
                              {progress}% completed • {c.topics.length} topics • {c.points || 0}pts
                            </p>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </>
                        ) : (
                          <p className="progress-text">
                            Topics will be added soon.
                          </p>
                        )}
                      </div>
                    );
                    })
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
                <p className="empty">
                  Contents for this course will be added soon.
                </p>
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

              {!!selectedCourse.topics.length && completedCourseIds.includes(selectedCourse.id) && (
                <p className="topic-content-hint">
                  Course completed. {selectedCourse.points || 0} points awarded.
                </p>
              )}
            </div>
          ) : (
            <div className="contents-card contents-placeholder">
              <h3>Course contents</h3>
              <p>Select a course on the left to view its topics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
