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
  const [warnings, setWarnings] = useState(0);
  const [warningToasts, setWarningToasts] = useState([]);
  const studentId = localStorage.getItem("userId");

  const location = useLocation();
const navigate = useNavigate();
const videoRef = useRef(null);
const overlayRef = useRef(null);
const examContainerRef = useRef(null);
const questionAreaRef = useRef(null);
const terminatedRef = useRef(false);
const lastViolationAtByTypeRef = useRef({});
const handleViolationRef = useRef(null);

const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  if (!window.matchMedia) return;
  const mq = window.matchMedia("(max-width: 768px)");
  const onChange = () => setIsMobile(!!mq.matches);
  onChange();
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else mq.addListener(onChange);
  return () => {
    if (mq.removeEventListener) mq.removeEventListener("change", onChange);
    else mq.removeListener(onChange);
  };
}, []);

const terminateExam = async () => {
  if (terminatedRef.current) return;
  terminatedRef.current = true;

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

const handleViolation = async (type) => {
  console.log("Violation:", type);

  // debounce per type so a single condition doesn't instantly end the exam
  const now = Date.now();
  const last = lastViolationAtByTypeRef.current[type] || 0;
  if (now - last < 5000) return;
  lastViolationAtByTypeRef.current[type] = now;

  setWarnings((prev) => {
    const next = Math.min(3, prev + 1);
    // Show small hover/toast box for a few seconds
    const id = Date.now() + Math.random();
    const labelMap = {
      "no-face": "Face not detected",
      "multiple-faces": "Multiple faces detected",
      "look-away": "Looking away frequently",
      "look-down": "Looking down frequently",
      "noise": "Noise detected",
      "tab-switch": "Tab switching detected",
      "copy-attempt": "Copy attempt detected",
      default: "Rule violation detected",
    };
    const message = labelMap[type] || labelMap.default;

    setWarningToasts((prevToasts) => [
      ...prevToasts,
      { id, message },
    ]);
    setTimeout(() => {
      setWarningToasts((prevToasts) =>
        prevToasts.filter((t) => t.id !== id)
      );
    }, 3500);
    if (next >= 3) {
      setTimeout(() => terminateExam(), 0);
    }
    return next;
  });

  try {
    await fetch("http://localhost:5000/api/violations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        student: studentId,
        test: id,
        type: type
      })
    });
  } catch (e) {
    // Avoid blocking the exam UI if violation logging fails
  }
};
handleViolationRef.current = handleViolation;
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

  // Prevent copying questions (but still allow typing in inputs/textarea)
  useEffect(() => {
    const isTextInput = (el) => {
      const tag = el?.tagName?.toLowerCase();
      return tag === "input" || tag === "textarea" || el?.isContentEditable;
    };

    const withinQuestionArea = (e) => {
      const container = questionAreaRef.current;
      if (!container) return false;
      const target = e.target;
      if (target && container.contains(target)) return true;
      const sel = window.getSelection?.();
      const anchor = sel?.anchorNode;
      return !!(anchor && container.contains(anchor.nodeType === 1 ? anchor : anchor.parentElement));
    };

    const onCopyLike = (e) => {
      if (!withinQuestionArea(e)) return;
      if (isTextInput(e.target)) return;
      e.preventDefault();
      handleViolationRef.current?.("copy-attempt");
    };

    const onContextMenu = (e) => {
      if (!withinQuestionArea(e)) return;
      if (isTextInput(e.target)) return;
      e.preventDefault();
      handleViolationRef.current?.("copy-attempt");
    };

    const onKeyDown = (e) => {
      if (!withinQuestionArea(e)) return;
      if (isTextInput(e.target)) return;
      const key = e.key?.toLowerCase();
      const isCopy = (e.ctrlKey || e.metaKey) && (key === "c" || key === "x" || key === "a");
      if (!isCopy) return;
      e.preventDefault();
      handleViolationRef.current?.("copy-attempt");
    };

    document.addEventListener("copy", onCopyLike, true);
    document.addEventListener("cut", onCopyLike, true);
    document.addEventListener("contextmenu", onContextMenu, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("copy", onCopyLike, true);
      document.removeEventListener("cut", onCopyLike, true);
      document.removeEventListener("contextmenu", onContextMenu, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  /* FETCH TEST + QUESTIONS */

const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON response");
  }
};

const fetchTest = async () => {

  try {

    const res = await fetch(`http://localhost:5000/api/tests/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch test (${res.status})`);
    }

    const data = await safeJson(res);
    if (!data) {
      throw new Error("Empty response from server");
    }

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

return (
  <>
    {/* ================= MONITORING COMPONENTS ================= */}
    <TabMonitor onViolation={handleViolation} />
    <NoiseMonitor onViolation={handleViolation} />
    <FaceMonitor videoRef={videoRef} overlayRef={overlayRef} onViolation={handleViolation} />

    {/* ================= WARNING TOASTS ================= */}
    <div
      style={{
        position: "fixed",
        top: isMobile ? "10px" : "16px",
        right: isMobile ? "10px" : "24px",
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {warningToasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#fff5e6",
            border: "1px solid #ffd8a8",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            fontSize: "13px",
            maxWidth: "260px",
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>

    {/* ================= MAIN EXAM LAYOUT ================= */}
    <div
      ref={examContainerRef}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        padding: isMobile ? "12px" : "20px",
        gap: isMobile ? "12px" : "20px",
        maxWidth: "1100px",
        margin: "0 auto"
      }}
    >

      {/* QUESTION NAVIGATION PANEL */}
      <div style={{ width: isMobile ? "100%" : "200px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Questions</h3>
          <div
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              background: warnings >= 2 ? "#ffe1e1" : "#f3f3f3",
              border: "1px solid #e6e6e6",
              fontSize: "14px",
              fontWeight: 600
            }}
          >
            Warnings: {warnings} / 3
          </div>
        </div>

        <div
          style={{
            display: isMobile ? "flex" : "block",
            gap: "8px",
            overflowX: isMobile ? "auto" : "visible",
            paddingTop: "10px"
          }}
        >
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              style={{
                flex: isMobile ? "0 0 auto" : "unset",
                marginBottom: isMobile ? 0 : "10px",
                background: answers[index] ? "#C5BAFF" : "#ddd",
                padding: "10px 12px",
                minWidth: isMobile ? "56px" : "100%",
                width: isMobile ? "auto" : "100%",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600
              }}
            >
              Q{index + 1}
            </button>
          ))}
        </div>

      </div>

      {/* QUESTION AREA */}
      <div style={{ flex: 1 }}>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "8px"
          }}
        >
          <h3 style={{ margin: 0 }}>Time Left: {formatTime()}</h3>
        </div>

        <div
          ref={questionAreaRef}
          style={{
            marginTop: "12px",
            padding: isMobile ? "12px" : "16px",
            borderRadius: "14px",
            border: "1px solid #eee",
            background: "#fff",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
        >
          <h4 style={{ marginTop: 0 }}>
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
        </div>

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

    {/* ================= FLOATING CAMERA + OVERLAY DURING EXAM ================= */}
    <div
      style={{
        position: "fixed",
        bottom: isMobile ? "12px" : "20px",
        right: isMobile ? "12px" : "20px",
        width: isMobile ? "120px" : "150px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
      <canvas
        ref={overlayRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </div>
  </>
);
}