import { useEffect, useState } from "react";

import "../../styles/student/academics.css";

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

        {/* Right: tabs + content (view only) */}
        <div className="academics-content">
          <div className="academics-header-row">
            <h3>{semesters[selectedSemesterIndex]}</h3>
            <span className="academics-subtitle">
              View uploaded materials & question papers
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

          {/* List only (no upload on student side) */}
          <div className="academics-list">
            {loading ? (
              <p>Loading {activeTab === "materials" ? "materials" : "papers"}...</p>
            ) : resources.length === 0 ? (
              <p className="empty">No items available for this semester.</p>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
