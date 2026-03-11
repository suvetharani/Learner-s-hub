import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import "../../styles/instructor/test.css";

export default function TestPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch tests
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/tests");

        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }

        const data = await response.json();
        setTests(data);
      } catch (error) {
        console.error("Error loading tests:", error);
      }
    };

    fetchTests();
  }, []);

  // ✅ Delete test
  const handleDelete = async (e, testId) => {
    e.stopPropagation(); // 🚀 prevents card click

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this test?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/tests/${testId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete test");
      }

      // Remove from UI instantly
      setTests((prev) => prev.filter((test) => test._id !== testId));
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const suggestedTitle =
      file.name.replace(/\.[^/.]+$/, "") || "Uploaded Test";
    const title =
      window.prompt("Enter a title for this test:", suggestedTitle) ||
      suggestedTitle;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    setUploading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/tests/generate-from-file",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to generate test from file");
      }

      const created = await res.json();

      // Navigate directly to the builder for fine-tuning
      navigate(`/instructor/create-test/${created._id}`);
    } catch (err) {
      console.error(err);
      alert("Could not generate test from this file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="test-container">
      <h2>Tests</h2>

      {/* Create Section */}
      <div className="test-options">
        <div className="card">
          <h3>Upload Test</h3>
          <p style={{ fontSize: "13px", marginBottom: "10px" }}>
            Upload a text or document file to auto-generate a test outline.
          </p>
          <input
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading && (
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
              Generating questions...
            </p>
          )}
        </div>

        <div
          className="card create-card"
          onClick={() => navigate("/instructor/create-test")}
        >
          <h3>+ Create Manually</h3>
          <p style={{ fontSize: "13px", marginTop: "8px" }}>
            Design each question yourself with full control.
          </p>
        </div>
      </div>

      {/* Saved Tests */}
      {tests.length > 0 && (
        <>
          <h3 style={{ marginTop: "50px" }}>Recent Tests</h3>

          <div className="saved-tests">
            {tests.map((test) => (
              <div
                key={test._id}
                className="saved-card"
                onClick={() =>
                  navigate(`/instructor/create-test/${test._id}`)
                }
              >
                <div className="card-header">
                  <h4>{test.title}</h4>

                  <Trash2
                    size={18}
                    className="delete-icon"
                    onClick={(e) => handleDelete(e, test._id)}
                  />
                </div>

                <p>{new Date(test.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}