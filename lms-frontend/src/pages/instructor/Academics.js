import { useEffect, useState } from "react";

import "../../styles/instructor/academics.css";

const semesters = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

export default function Academics() {
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("materials"); // "materials" | "question-paper"
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const token = localStorage.getItem("token");

  const currentSemesterNumber = selectedSemesterIndex + 1;

  useEffect(() => {
    fetchResources(currentSemesterNumber, activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemesterIndex, activeTab]);

  const fetchResources = async (semesterNumber, tab) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/academics?semester=${semesterNumber}&type=${
          tab === "materials" ? "material" : "question-paper"
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setResources(data);
      } else {
        console.error(data.message || "Failed to load resources");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("semester", currentSemesterNumber);
      formData.append(
        "resourceType",
        activeTab === "materials" ? "material" : "question-paper"
      );
      if (title.trim()) {
        formData.append("title", title.trim());
      }

      const res = await fetch("http://localhost:5000/api/academics/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setFile(null);
        setTitle("");
        fetchResources(currentSemesterNumber, activeTab);
      } else {
        alert(data.message || "Failed to upload");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/academics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(data.message || "Failed to delete resource");
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="academics">
      <div className="academics-layout">
        {/* Left: semester list */}
        <div className="academics-semester-list">
          {semesters.map((label, index) => (
            <button
              key={label}
              className={`semester-pill ${
                selectedSemesterIndex === index ? "active" : ""
              }`}
              onClick={() => setSelectedSemesterIndex(index)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right: tabs + content */}
        <div className="academics-content">
          <div className="academics-header-row">
            <h3>{semesters[selectedSemesterIndex]}</h3>
            <span className="academics-subtitle">
              Manage materials & question papers
            </span>
          </div>

          {/* Tabs */}
          <div className="academics-tabs">
            <button
              className={`academics-tab ${
                activeTab === "materials" ? "active" : ""
              }`}
              onClick={() => setActiveTab("materials")}
            >
              Materials
            </button>
            <button
              className={`academics-tab ${
                activeTab === "question-paper" ? "active" : ""
              }`}
              onClick={() => setActiveTab("question-paper")}
            >
              Question Papers
            </button>
          </div>

          {/* Upload (instructor only) */}
          <form className="academics-upload" onSubmit={handleUpload}>
            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,image/*"
            />
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          {/* List */}
          <div className="academics-list">
            {loading ? (
              <p>Loading {activeTab === "materials" ? "materials" : "papers"}...</p>
            ) : resources.length === 0 ? (
              <p className="empty">No items uploaded yet.</p>
            ) : (
              resources.map((item) => (
                <div key={item._id} className="academics-item-card">
                  <div className="academics-item-main">
                    <h4>{item.title || item.fileName}</h4>
                    <span className="academics-item-meta">
                      Semester {item.semester} •{" "}
                      {item.resourceType === "material"
                        ? "Material"
                        : "Question Paper"}
                    </span>
                  </div>
                  <div className="academics-item-actions">
                    <a
                      href={`http://localhost:5000/${item.fileUrl.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="academics-item-link"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      className="academics-delete-btn"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
