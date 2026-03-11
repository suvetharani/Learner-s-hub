import { useEffect, useState } from "react";
import "../../styles/student/courses.css";

// Static course structure (topics map to local .txt content files inside public/courses)
const domainConfig = [
  {
    title: "Artificial Intelligence",
    courses: [
      {
        id: "intro-ai",
        name: "Introduction to AI",
        topics: [
          {
            id: "whatisai",
            title: "What is AI?",
            filePath: "/courses/ArtificialIntelligence/whatisAI.txt",
          },
          {
            id: "ai-applications",
            title: "AI Applications",
            filePath: "/courses/ArtificialIntelligence/aiApplications.txt",
          },
        ],
      },
      {
        id: "ml-basics",
        name: "Machine Learning Basics",
        topics: [],
      },
      {
        id: "nn-basics",
        name: "Neural Networks",
        topics: [],
      },
    ],
  },
  {
    title: "Cybersecurity",
    courses: [
      {
        id: "network-security",
        name: "Network Security",
        topics: [
          {
            id: "what-is-threats",
            title: "What are Threats?",
            filePath: "/courses/cybersecurity/whatisthreats.txt",
          },
        ],
      },
      {
        id: "ethical-hacking",
        name: "Ethical Hacking",
        topics: [],
      },
      {
        id: "cryptography",
        name: "Cryptography",
        topics: [],
      },
    ],
  },
  {
    title: "Web Development",
    courses: [
      {
        id: "html-css",
        name: "HTML & CSS",
        topics: [],
      },
      {
        id: "javascript",
        name: "JavaScript",
        topics: [],
      },
      {
        id: "react-basics",
        name: "React Basics",
        topics: [],
      },
    ],
  },
  {
    title: "App Development",
    courses: [
      {
        id: "flutter-basics",
        name: "Flutter Basics",
        topics: [],
      },
      {
        id: "firebase",
        name: "Firebase",
        topics: [],
      },
    ],
  },
  {
    title: "Cloud Computing",
    courses: [],
  },
];

const PROGRESS_KEY = "courseTopicProgress";
const RECENT_COURSES_KEY = "recentCourses";

export default function BasicComputerCourses() {
  const [openDomain, setOpenDomain] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [domains, setDomains] = useState(domainConfig);
  const [activeTopic, setActiveTopic] = useState(null);
  const [topicContent, setTopicContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");
  const [readTopicIds, setReadTopicIds] = useState(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(readTopicIds));
    } catch {
      // ignore
    }
  }, [readTopicIds]);

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
      topics: course.topics || [],
    };

    setSelectedCourse(coursePayload);

    // compute progress for this course so CurrentCourses can display it
    const progress = computeCourseProgress(course);

    // persist to "recent courses" so CurrentCourses can read it
    try {
      const raw = localStorage.getItem(RECENT_COURSES_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const updated = Array.isArray(list) ? [...list] : [];

      const idx = updated.findIndex((c) => c.id === course.id);
      const entry = {
        id: course.id,
        name: course.name,
        domain: domainTitle,
        progress,
        lastAccessed: new Date().toISOString(),
      };

      if (idx >= 0) {
        updated[idx] = entry;
      } else {
        updated.unshift(entry);
      }

      const finalList = updated.slice(0, 10);
      localStorage.setItem(RECENT_COURSES_KEY, JSON.stringify(finalList));

      // notify other components (like CurrentCourses) inside this tab
      window.dispatchEvent(new Event("recentCoursesUpdated"));
    } catch {
      // ignore storage errors
    }

    // clear previously selected topic/content when switching course
    setActiveTopic(null);
    setTopicContent("");
    setContentError("");
  };

  const computeCourseProgress = (course) => {
    const totalTopics = course.topics?.length || 0;
    if (totalTopics === 0) return 0;
    const readCount = course.topics.filter((t) =>
      readTopicIds.includes(`${course.id}:${t.id}`)
    ).length;
    return Math.round((readCount / totalTopics) * 100);
  };

  const handleTopicClick = (courseId, topic) => {
    if (!topic?.filePath) return;

    const key = `${courseId}:${topic.id}`;
    setReadTopicIds((prev) =>
      prev.includes(key) ? prev : [...prev, key]
    );

    const href = topic.filePath.startsWith("/")
      ? topic.filePath
      : `/${topic.filePath}`;

    setActiveTopic({
      id: topic.id,
      title: topic.title,
    });
    setLoadingContent(true);
    setContentError("");
    setTopicContent("");

    fetch(href)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load content");
        }
        return res.text();
      })
      .then((text) => {
        setTopicContent(text);
      })
      .catch(() => {
        setContentError("Unable to load this topic content. Please try again.");
      })
      .finally(() => {
        setLoadingContent(false);
      });
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
                              {progress}% completed • {c.topics.length} topics
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
                Domain: {selectedCourse.domain}
              </p>

              {selectedCourse.topics.length === 0 ? (
                <p className="empty">
                  Contents for this course will be added soon.
                </p>
              ) : (
                <>
                  <ul className="contents-list">
                    {selectedCourse.topics.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          className={
                            activeTopic?.id === topic.id ? "active-topic" : ""
                          }
                          onClick={() =>
                            handleTopicClick(selectedCourse.id, topic)
                          }
                        >
                          {topic.title}
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="topic-content-panel">
                    {loadingContent && (
                      <p className="topic-content-hint">Loading content...</p>
                    )}

                    {contentError && !loadingContent && (
                      <p className="topic-content-error">{contentError}</p>
                    )}

                    {!loadingContent && !contentError && topicContent && (
                      <>
                        <h4 className="topic-content-title">
                          {activeTopic?.title}
                        </h4>
                        <pre className="topic-content-body">
                          {topicContent}
                        </pre>
                      </>
                    )}

                    {!loadingContent &&
                      !contentError &&
                      !topicContent &&
                      activeTopic && (
                        <p className="topic-content-hint">
                          Click a topic again if the content does not appear.
                        </p>
                      )}
                  </div>
                </>
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
