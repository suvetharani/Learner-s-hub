import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import "../../styles/student/courses.css";

export default function CourseTopicPage() {
  const { courseId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [topicContent, setTopicContent] = useState("");

  const search = new URLSearchParams(location.search);
  const topicTitle =
    location.state?.topicTitle || decodeURIComponent(search.get("title") || "Topic");
  const filePath =
    location.state?.filePath || decodeURIComponent(search.get("file") || "");

  useEffect(() => {
    if (!filePath) {
      setLoading(false);
      setContentError("Topic file path is missing.");
      return;
    }

    const href = filePath.startsWith("/") ? filePath : `/${filePath}`;
    fetch(href)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.text();
      })
      .then((text) => setTopicContent(text))
      .catch(() =>
        setContentError("Unable to load this topic content. Please try again.")
      )
      .finally(() => setLoading(false));
  }, [filePath]);

  return (
    <div className="basic-courses topic-page">
      <div className="topic-hero">
        <div className="topic-hero-left">
          <p className="topic-breadcrumb">
            <Link to="/student/courses">Courses</Link> / {courseId}
          </p>
          <h1 className="topic-heading">{topicTitle}</h1>
          <p className="topic-subheading">
            Structured reading view for focused learning.
          </p>
        </div>
        <Link to="/student/courses" className="topic-back-btn">
          Back to courses
        </Link>
      </div>

      <div className="contents-card topic-content-card">
        {loading && <p className="topic-content-hint">Loading content...</p>}
        {!!contentError && !loading && (
          <p className="topic-content-error">{contentError}</p>
        )}
        {!loading && !contentError && (
          <pre className="topic-content-body topic-content-full">{topicContent}</pre>
        )}
      </div>
    </div>
  );
}

