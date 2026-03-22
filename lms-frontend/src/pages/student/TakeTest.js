import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student/taketest.css";

export default function TakeTest() {
  const [tests, setTests] = useState([]);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tests/all?forStudent=true");
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

      {/* RULES SECTION */}
      <div className="rules-box">
        <h2>Exam Rules & Regulations</h2>

        <ul>
          <li>Camera and microphone must remain ON during the exam.</li>
          <li>Video monitoring will be active throughout the test.</li>
          <li>Tab switching or leaving the exam window will be recorded.</li>
          <li>Multiple faces detected will be flagged as a violation.</li>
          <li>Eye movement and suspicious behaviour may be monitored.</li>
          <li>Copy, paste and right-click actions are restricted.</li>
          <li>Background noise will be monitored using the microphone.</li>
          <li>Any violation may result in exam termination.</li>
        </ul>

        <div className="rules-agree">
          <input
            type="checkbox"
            id="agree"
            checked={acceptedRules}
            onChange={() => setAcceptedRules(!acceptedRules)}
          />
          <label htmlFor="agree">
            I agree to follow all the exam rules and regulations
          </label>
        </div>
      </div>

      <h2 className="test-heading">Available Tests</h2>

      <div className="test-grid">
        {tests.length === 0 ? (
          <p>No tests available.</p>
        ) : (
          tests.map((test) => (
            <div key={test._id} className="test-card">
              <h3>{test.title}</h3>
              <p>{test.description}</p>
              <p><strong>Duration:</strong> {test.duration || 30} mins</p>
              <p><strong>Total Marks:</strong> {test.totalMarks ?? 0}</p>
              <p><strong>Instructor:</strong> {test.instructor?.name}</p>

              <button
                disabled={!acceptedRules}
                onClick={() => navigate(`/student/test/${test._id}`)}
                className="start-btn"
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