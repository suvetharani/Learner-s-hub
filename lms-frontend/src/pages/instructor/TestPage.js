import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/instructor/test.css";

export default function TestPage() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);

  // ✅ Fetch tests from backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/tests"
        );

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

  return (
    <div className="test-container">
      <h2>Tests</h2>

      {/* Create Section */}
      <div className="test-options">
        <div className="card">
          <h3>Upload Test</h3>
          <input type="file" accept=".pdf,.doc,.docx" />
        </div>

        <div
          className="card create-card"
          onClick={() => navigate("/instructor/create-test")}
        >
          <h3>+ Create Manually</h3>
        </div>
      </div>

      {/* Backend Tests */}
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
                <h4>{test.title}</h4>
                <p>
                  {new Date(test.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}