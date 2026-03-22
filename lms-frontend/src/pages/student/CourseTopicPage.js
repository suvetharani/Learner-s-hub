import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Maximize2 } from "lucide-react";
import "../../styles/student/courses.css";
import "../../styles/instructor/topic-media.css";

const API = "http://localhost:5000/api";

export default function CourseTopicPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const videoRefs = useRef({});

  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [media, setMedia] = useState([]);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);

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

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${API}/topic-media/${courseId}/${topicId}`);
      const data = await res.json();
      if (res.ok) setMedia(Array.isArray(data) ? data : []);
    } catch {
      setMedia([]);
    }
  };

  useEffect(() => {
    if (courseId && topicId) fetchMedia();
  }, [courseId, topicId]);

  const mediaUrl = (path) =>
    path.startsWith("http") ? path : `http://localhost:5000/${path}`;

  const handleVideoFullscreen = (mediaId) => {
    const video = videoRefs.current[mediaId];
    if (video) {
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    }
  };

  const handleImageFullscreen = (m) => {
    setFullscreenMedia(m);
  };

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

      {media.length > 0 && (
        <div className="topic-media-section topic-media-student">
          <h3>Topic Media</h3>
          <div className="topic-media-grid">
            {media.map((m) => (
              <div key={m._id} className="topic-media-item">
                {m.type === "image" ? (
                  <div className="topic-media-preview-wrap">
                    <img
                      src={mediaUrl(m.path)}
                      alt={m.originalName || "Media"}
                      onClick={() => handleImageFullscreen(m)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleImageFullscreen(m)}
                    />
                    <button
                      type="button"
                      className="topic-media-fullscreen-btn"
                      onClick={() => handleImageFullscreen(m)}
                      title="View fullscreen"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="topic-media-preview-wrap">
                    <video
                      ref={(el) => { videoRefs.current[m._id] = el; }}
                      controls
                      src={mediaUrl(m.path)}
                    />
                    <button
                      type="button"
                      className="topic-media-fullscreen-btn"
                      onClick={() => handleVideoFullscreen(m._id)}
                      title="View fullscreen"
                    >
                      <Maximize2 size={18} />
                    </button>
                  </div>
                )}
                <div className="topic-media-meta topic-media-meta-student">
                  <span>{m.originalName || m.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fullscreenMedia && fullscreenMedia.type === "image" && (
        <div
          className="topic-media-fullscreen-overlay"
          onClick={() => setFullscreenMedia(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Escape" && setFullscreenMedia(null)}
        >
          <img
            src={mediaUrl(fullscreenMedia.path)}
            alt={fullscreenMedia.originalName || "Media"}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="topic-media-close-fullscreen"
            onClick={() => setFullscreenMedia(null)}
            aria-label="Close fullscreen"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

