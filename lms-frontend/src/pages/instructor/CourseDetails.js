
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState([]);
  const [materials, setMaterials] = useState([]);
  

  useEffect(() => {
    fetchRequests();
    fetchStudents();
    fetchMaterials();
  }, []);

  // 🔹 Fetch Join Requests
  const fetchRequests = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}/requests`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setRequests(data);
  };

  // 🔹 Fetch Students
  const fetchStudents = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}/students`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setStudents(data);
  };

  // 🔹 Fetch Materials (we’ll read from course itself)
  const fetchMaterials = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/instructor`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    const currentCourse = data.find((c) => c._id === id);
    if (currentCourse) {
      setMaterials(currentCourse.materials || []);
    }
  };

  // 🔹 Approve Student
  const approveStudent = async (studentId) => {
    await fetch(
      `http://localhost:5000/api/courses/${id}/approve/${studentId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    fetchRequests();
    fetchStudents();
  };

  // 🔹 Upload File
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(
      `http://localhost:5000/api/courses/${id}/upload`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    alert("File uploaded successfully");
    fetchMaterials();
  };

  const deleteMaterial = async (index) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this file?");
  if (!confirmDelete) return;

  await fetch(
    `http://localhost:5000/api/courses/${id}/material/${index}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  fetchMaterials(); // Refresh list
};
// 🔹 Remove Student
const removeStudent = async (studentId) => {
  const confirmRemove = window.confirm(
    "Are you sure you want to remove this student?"
  );

  if (!confirmRemove) return;

  await fetch(
    `http://localhost:5000/api/courses/${id}/remove/${studentId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  fetchStudents(); // refresh students list
};

  return (
    <div className="classroom-page">
      <h2>Course Management</h2>

      {/* 🔥 TAB MENU */}
      <div className="tab-menu">
        <button onClick={() => setActiveTab("requests")}>
          Join Requests
        </button>
        <button onClick={() => setActiveTab("students")}>
          Students
        </button>
        <button onClick={() => setActiveTab("materials")}>
          Materials
        </button>
      </div>

      {/* 🔥 TAB CONTENT */}
      <div className="tab-content">
{activeTab === "requests" && (
  <div className="requests-section">
    {requests.length === 0 ? (
      <p className="empty-text">No pending join requests</p>
    ) : (
      requests.map((req) => (
        <div key={req._id} className="request-card">
          <div className="user-info">
            <div className="avatar">
              {req.name.charAt(0).toUpperCase()}
            </div>
            <span>{req.name}</span>
          </div>

          <button
            className="approve-btn"
            onClick={() => approveStudent(req._id)}
          >
            Approve
          </button>
        </div>
      ))
    )}
  </div>
)}

{activeTab === "students" && (
  <div className="students-section">
    {students.length === 0 ? (
      <p className="empty-text">No students enrolled</p>
    ) : (
      students.map((stu) => (
<div key={stu._id} className="student-card">

  {/* 🔥 PROFILE IMAGE OR FALLBACK */}
  {stu.profileImage ? (
    <img
      src={`http://localhost:5000/${stu.profileImage}`}
      alt={stu.name}
      className="profile-img"
    />
  ) : (
    <div className="avatar">
      {stu.name.charAt(0).toUpperCase()}
    </div>
  )}

  <span>{stu.name}</span>

  {/* 🔥 REMOVE BUTTON */}
  <button
    className="remove-btn"
    onClick={() => removeStudent(stu._id)}
  >
    Remove
  </button>

</div>
      ))
    )}
  </div>
)}

{activeTab === "materials" && (
  <div className="materials-section">
    <div className="upload-box">
      <h3>Upload New File</h3>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileUpload}
      />
    </div>

    <div className="materials-grid">
      {materials.length === 0 ? (
        <p className="empty-text">No files uploaded yet</p>
      ) : (
        materials.map((file, index) => (
          <div key={index} className="material-card">
            <div className="file-icon">📄</div>

            <div className="file-details">
              <h4>{file.fileName}</h4>
              <p>Course Material</p>

<div className="material-actions">
  <a
    href={`http://localhost:5000/${file.fileUrl}`}
    target="_blank"
    rel="noreferrer"
  >
    View
  </a>

  <a
    href={`http://localhost:5000/${file.fileUrl}`}
    download
  >
    Download
  </a>

  <button
    className="delete-btn"
    onClick={() => deleteMaterial(index)}
  >
    Delete
  </button>
</div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
}