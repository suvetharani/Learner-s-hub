import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TabMonitor from "../../components/TabMonitor";
import NoiseMonitor from "../../components/NoiseMonitor";
import FaceMonitor from "../../components/FaceMonitor";
import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function StartExam() {

  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const studentId = localStorage.getItem("userId");

  const location = useLocation();
const navigate = useNavigate();
const videoRef = useRef(null);

const terminateExam = async () => {

  await fetch("http://localhost:5000/api/tests/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentId,
      testId: id,
      answers: Object.entries(answers).map(([qIndex, ans]) => ({
        questionIndex: Number(qIndex),
        answer: ans
      })),
      terminated: true
    })
  });

  alert("Exam terminated due to violation");

  navigate("/student/tests");

};
const stream = location.state?.stream;
useEffect(() => {
  startCamera();
}, []);

const startCamera = async () => {
  try {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    // Detect camera off
    stream.getVideoTracks()[0].onended = () => {
      alert("Camera turned off. Exam terminated.");
      terminateExam();
    };

  } catch (err) {
    alert("Camera access required for exam.");
  }
};
  useEffect(() => {
    fetchTest();
  }, []);

  /* FETCH TEST + QUESTIONS */

const fetchTest = async () => {

  try {

    const res = await fetch(`http://localhost:5000/api/tests/${id}`);

    if (!res.ok) {
      throw new Error("Failed to fetch test");
    }

    const data = await res.json();

    setQuestions(data.questions || []);
    setTimeLeft((data.duration || 0) * 60);

  } catch (err) {

    console.error("Error loading exam:", err);

  }

};

  useEffect(() => {

  if (stream && videoRef.current) {
    videoRef.current.srcObject = stream;

    stream.getVideoTracks()[0].onended = () => {
      alert("Camera turned off. Exam terminated.");
      terminateExam();
    };
  }

}, [stream]);

  /* TIMER */

useEffect(() => {

  if (timeLeft === null) return;

  if (timeLeft <= 0) {
    submitExam();
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);

}, [timeLeft]);

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };





  /* SAVE ANSWERS */

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [current]: value
    });
  };

  /* SUBMIT EXAM */

const submitExam = async () => {

  const confirmSubmit = window.confirm("Are you sure you want to submit the exam?");
  if (!confirmSubmit) return;

  await fetch("http://localhost:5000/api/tests/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentId,
      testId: id,
      answers: Object.entries(answers).map(([qIndex, ans]) => ({
  questionIndex: Number(qIndex),
  answer: ans
})),
      terminated:false
    })
  });

  alert("Exam submitted successfully");

  navigate("/student/tests");

};

  if (questions.length === 0) return <p>Loading exam...</p>;

  const q = questions[current];

const handleViolation = async (type) => {

  console.log("Violation:", type);

  await fetch("http://localhost:5000/api/violations", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      student: studentId,
      test: id,
      type: type
    })
  });

};

return (
  <>
    {/* ================= MONITORING COMPONENTS ================= */}
    <TabMonitor onViolation={handleViolation} />
    <NoiseMonitor onViolation={handleViolation} />
    <FaceMonitor videoRef={videoRef} onViolation={handleViolation} />

    {/* ================= MAIN EXAM LAYOUT ================= */}
    <div style={{ display: "flex", padding: "20px", gap: "20px" }}>

      {/* QUESTION NAVIGATION PANEL */}
      <div style={{ width: "200px" }}>

        <h3>Questions</h3>

        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            style={{
              display: "block",
              marginBottom: "10px",
              background: answers[index] ? "#C5BAFF" : "#ddd",
              padding: "8px",
              width: "100%"
            }}
          >
            Q{index + 1}
          </button>
        ))}

      </div>

      {/* QUESTION AREA */}
      <div style={{ flex: 1 }}>

        <h3>Time Left: {formatTime()}</h3>

        <h4>
          {current + 1}. {q.questionText}
        </h4>

        {/* MULTIPLE CHOICE */}
        {q.type === "mcq" &&
          q.options.map((opt, i) => (
            <div key={i}>
              <label>
                <input
                  type="radio"
                  name={`q-${current}`}
                  value={opt}
                  checked={answers[current] === opt}
                  onChange={() => handleAnswer(opt)}
                />
                {opt}
              </label>
            </div>
          ))}

        {/* SHORT ANSWER */}
        {q.type === "short" && (
          <input
            type="text"
            value={answers[current] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "10px"
            }}
          />
        )}

        {/* PARAGRAPH */}
        {q.type === "paragraph" && (
          <textarea
            rows="5"
            value={answers[current] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px"
            }}
          />
        )}

        {/* NAVIGATION BUTTONS */}
        <div style={{ marginTop: "20px" }}>

          {current > 0 && (
            <button onClick={() => setCurrent(current - 1)}>
              Previous
            </button>
          )}

          {current < questions.length - 1 && (
            <button
              style={{ marginLeft: "10px" }}
              onClick={() => setCurrent(current + 1)}
            >
              Next
            </button>
          )}

          {current === questions.length - 1 && (
            <button
              style={{ marginLeft: "10px", background: "#C5BAFF" }}
              onClick={submitExam}
            >
              Submit Exam
            </button>
          )}

        </div>

      </div>

    </div>

    {/* ================= FLOATING CAMERA DURING EXAM ================= */}
    <video
      ref={videoRef}
      autoPlay
      muted
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "150px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        zIndex: 1000
      }}
    />
  </>
);
}