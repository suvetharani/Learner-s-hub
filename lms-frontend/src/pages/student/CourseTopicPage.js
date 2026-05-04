import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Maximize2 } from "lucide-react";
import TopicQuizPanel from "../../components/student/TopicQuizPanel";
import { syncTopicCourseProgress } from "../../utils/courseProgressSync";
import "../../styles/student/courses.css";
import "../../styles/instructor/topic-media.css";
import "../../styles/student/topic-quiz.css";

const RAW_API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const trimmedApiBase = String(RAW_API_BASE || "").replace(/\/+$/, "");
const API = trimmedApiBase.endsWith("/api")
  ? trimmedApiBase
  : `${trimmedApiBase}/api`;

export default function CourseTopicPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const videoRefs = useRef({});

  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [media, setMedia] = useState([]);
  const [fullscreenMedia, setFullscreenMedia] = useState(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const [topicProgressDone, setTopicProgressDone] = useState(false);
  const [quizMeta, setQuizMeta] = useState({ status: "loading" });
  const completionSyncedRef = useRef(false);
  const [contentComplete, setContentComplete] = useState(false);
  const [viewedMediaIds, setViewedMediaIds] = useState([]);
  const [quizResult, setQuizResult] = useState({ submitted: false, passed: false, correctCount: 0, total: 0 });

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

  useEffect(() => {
    if (!userId) {
      setTopicProgressDone(false);
      return;
    }
    const key = `${courseId}:${topicId}`;
    fetch(`${API}/users/course-progress/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setTopicProgressDone(Array.isArray(d.readTopicIds) && d.readTopicIds.includes(key));
      })
      .catch(() => setTopicProgressDone(false));
  }, [userId, courseId, topicId]);

  useEffect(() => {
    let cancelled = false;
    setQuizMeta({ status: "loading" });
    fetch(
      `${API}/topic-quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}?forStudent=true`
    )
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setQuizMeta({ status: "none" });
          return;
        }
        if (!res.ok) {
          setQuizMeta({ status: "error" });
          return;
        }
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizMeta({ status: "ready", quiz: data });
        } else {
          setQuizMeta({ status: "none" });
        }
      })
      .catch(() => {
        if (!cancelled) setQuizMeta({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [courseId, topicId]);

  useEffect(() => {
    completionSyncedRef.current = false;
    setContentComplete(false);
    setViewedMediaIds([]);
    setQuizResult({ submitted: false, passed: false, correctCount: 0, total: 0 });
  }, [courseId, topicId]);

  useEffect(() => {
    if (!topicProgressDone) return;
    setContentComplete(true);
    if (media.length > 0) {
      setViewedMediaIds(media.map((m) => m._id));
    }
    if (quizMeta.status === "ready") {
      setQuizResult((prev) => ({
        ...prev,
        submitted: true,
        passed: true,
        total: quizMeta.quiz?.questions?.length || prev.total,
        correctCount: quizMeta.quiz?.questions?.length || prev.correctCount,
      }));
    }
  }, [topicProgressDone, media, quizMeta]);

  const mediaComplete = media.length === 0 || viewedMediaIds.length >= media.length;
  const hasQuiz = quizMeta.status === "ready";
  const quizComplete = hasQuiz ? quizResult.passed || topicProgressDone : true;
  const completedSteps = [contentComplete, mediaComplete, quizComplete].filter(Boolean).length;
  const topicCompletionPercent = Math.round((completedSteps / 3) * 100);
  const topicFullyComplete = topicCompletionPercent === 100;

  useEffect(() => {
    if (!topicFullyComplete || !userId || topicProgressDone || completionSyncedRef.current) {
      return;
    }
    completionSyncedRef.current = true;
    (async () => {
      await syncTopicCourseProgress(userId, courseId, topicId);
      setTopicProgressDone(true);
    })();
  }, [topicFullyComplete, topicProgressDone, userId, courseId, topicId]);

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
    setViewedMediaIds((prev) => (prev.includes(m._id) ? prev : [...prev, m._id]));
    setFullscreenMedia(m);
  };

  const handleVideoWatched = (mediaId) => {
    setViewedMediaIds((prev) => (prev.includes(mediaId) ? prev : [...prev, mediaId]));
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
            Read the topic below. If this topic has a quiz, you will see every question and all answer choices—submit
            when ready; if anything is wrong, the page will ask you to attempt the quiz again.
          </p>
        </div>
        <Link to="/student/courses" className="topic-back-btn">
          Back to courses
        </Link>
      </div>

      <div className="contents-card topic-content-card">
        <div className="topic-progress-overview">
          <div>
            <p className="topic-progress-label">Topic completion</p>
            <h3 className="topic-progress-value">{topicCompletionPercent}% completed</h3>
          </div>
          {topicFullyComplete && <span className="topic-progress-chip">100% completed</span>}
        </div>
        <div className="topic-progress-track">
          <div className="topic-progress-fill" style={{ width: `${topicCompletionPercent}%` }} />
        </div>
        <div className="topic-progress-parts">
          <span className={contentComplete ? "done" : ""}>Content</span>
          <span className={mediaComplete ? "done" : ""}>Media</span>
          <span className={quizComplete ? "done" : ""}>Quiz</span>
        </div>
        {loading && <p className="topic-content-hint">Loading content...</p>}
        {!!contentError && !loading && (
          <p className="topic-content-error">{contentError}</p>
        )}
        {!loading && !contentError && (
          <>
            <pre className="topic-content-body topic-content-full">{topicContent}</pre>
            <div className="topic-content-actions">
              <button
                type="button"
                className="topic-mark-btn"
                onClick={() => setContentComplete(true)}
                disabled={contentComplete}
              >
                {contentComplete ? "Content marked complete" : "Mark content as completed"}
              </button>
            </div>
          </>
        )}
      </div>

      {quizMeta.status === "error" && (
        <div className="contents-card topic-content-card" style={{ marginTop: "1rem" }}>
          <p className="topic-content-error">
            Unable to verify whether this topic requires a quiz. Refresh the page after the server is
            reachable.
          </p>
        </div>
      )}

      {quizMeta.status === "ready" && (
        <>
          {quizResult.submitted && (
            <div className="contents-card topic-content-card" style={{ marginTop: "1rem" }}>
              <p className={quizResult.passed ? "topic-content-hint" : "topic-content-error"}>
                {quizResult.passed
                  ? `Quiz result: ${quizResult.correctCount}/${quizResult.total} correct.`
                  : `Quiz result: ${quizResult.correctCount}/${quizResult.total} correct. Submit again to improve.`}
              </p>
            </div>
          )}
          <TopicQuizPanel
            courseId={courseId}
            topicId={topicId}
            quiz={quizMeta.quiz}
            readTopicComplete={topicProgressDone}
            onPassed={async () => {
              setQuizResult({
                submitted: true,
                passed: true,
                total: quizMeta.quiz?.questions?.length || 0,
                correctCount: quizMeta.quiz?.questions?.length || 0,
              });
            }}
            onEvaluated={(result) => {
              setQuizResult(result);
            }}
          />
        </>
      )}

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
                      onEnded={() => handleVideoWatched(m._id)}
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

