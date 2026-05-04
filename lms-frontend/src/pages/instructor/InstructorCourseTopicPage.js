import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Upload, Trash2 } from "lucide-react";
import TopicQuizEditor from "../../components/instructor/TopicQuizEditor";
import "../../styles/student/courses.css";
import "../../styles/instructor/topic-media.css";
import "../../styles/student/topic-quiz.css";

const RAW_API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const trimmedApiBase = String(RAW_API_BASE || "").replace(/\/+$/, "");
const API = trimmedApiBase.endsWith("/api")
  ? trimmedApiBase
  : `${trimmedApiBase}/api`;

export default function InstructorCourseTopicPage() {
  const { courseId, topicId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const search = new URLSearchParams(location.search);
  const topicTitle =
    location.state?.topicTitle || decodeURIComponent(search.get("title") || "Topic");
  const filePath =
    location.state?.filePath || decodeURIComponent(search.get("file") || "");

  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");
  const [topicContent, setTopicContent] = useState("");
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      .catch(() => setContentError("Unable to load this topic content."))
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
    fetchMedia();
  }, [courseId, topicId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      const duration = await getVideoDuration(file);
      if (duration > 300) {
        alert("Video must be 5 minutes or less.");
        return;
      }
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("media", file);
    formData.append("instructorId", localStorage.getItem("userId") || "");

    try {
      const res = await fetch(`${API}/topic-media/${courseId}/${topicId}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await fetchMedia();
    } catch (err) {
      alert("Upload failed. " + (err.message || "Try again."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(file);
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      const res = await fetch(`${API}/topic-media/${id}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchMedia();
    } catch {
      alert("Failed to delete.");
    }
  };

  const mediaUrl = (path) =>
    path.startsWith("http") ? path : `http://localhost:5000/${path}`;

  return (
    <div className="basic-courses topic-page">
      <div className="topic-hero">
        <div className="topic-hero-left">
          <p className="topic-breadcrumb">
            <Link to="/instructor/courses">Courses</Link> / {courseId}
          </p>
          <h1 className="topic-heading">{topicTitle}</h1>
          <p className="topic-subheading">
            Add media and an optional topic quiz below. Students need correct quiz answers (or no quiz) to complete the topic.
          </p>
        </div>
        <div className="topic-hero-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="topic-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Image/Video"}
          </button>
          <Link to="/instructor/courses" className="topic-back-btn">
            Back to courses
          </Link>
        </div>
      </div>

      <div className="contents-card topic-content-card">
        {loading && <p className="topic-content-hint">Loading content...</p>}
        {!!contentError && !loading && (
          <p className="topic-content-error">{contentError}</p>
        )}
        {!loading && !contentError && (
          <pre className="topic-content-body topic-content-full">
            {topicContent}
          </pre>
        )}
      </div>

      <TopicQuizEditor courseId={courseId} topicId={topicId} />

      {media.length > 0 && (
        <div className="topic-media-section">
          <h3>Uploaded Media</h3>
          <div className="topic-media-grid">
            {media.map((m) => (
              <div key={m._id} className="topic-media-item">
                {m.type === "image" ? (
                  <img src={mediaUrl(m.path)} alt={m.originalName || "Media"} />
                ) : (
                  <video controls src={mediaUrl(m.path)} />
                )}
                <div className="topic-media-meta">
                  <span>{m.originalName || m.type}</span>
                  <button
                    type="button"
                    className="topic-media-delete"
                    onClick={() => handleDelete(m._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
