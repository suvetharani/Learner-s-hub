import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student/taketest.css";

export default function TakeTest() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tests/all");
        const data = await res.json();
        setTests(data);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };

    fetchTests();
  }, []);

  return (
    <div className="take-test-container">
      <h2>Available Tests</h2>

      <div className="test-grid">
        {tests.length === 0 ? (
          <p>No tests available.</p>
        ) : (
          tests.map((test) => (
            <div key={test._id} className="test-card">
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <p><strong>Duration:</strong> {test.duration} mins</p>
              <p><strong>Total Marks:</strong> {test.totalMarks}</p>
              <p><strong>Instructor:</strong> {test.instructor?.name}</p>

              <button
                onClick={() => navigate(`/student/test/${test._id}`)}
              >
                Start Test
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}