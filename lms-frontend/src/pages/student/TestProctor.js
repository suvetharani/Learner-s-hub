import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function TestProctor() {

  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      stream.getVideoTracks()[0].onended = () => {

  alert("Camera turned off. Exam terminated.");

  terminateExam();

};

      videoRef.current.srcObject = stream;
      setReady(true);

    } catch (err) {
      alert("Camera and microphone access required to start the test.");
    }
  };

  /* Drag start */
  const handleMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  /* Drag move */
  const handleMouseMove = (e) => {
    if (!dragging.current) return;

    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y
    });
  };

  /* Drag stop */
  const handleMouseUp = () => {
    dragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });
  const terminateExam = async () => {
  const studentId = localStorage.getItem("userId");

  await fetch("http://localhost:5000/api/tests/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentId,
      testId: id,
      answers: {},
      terminated: true
    })
  });

  navigate("/student/tests");

};

  return (
    <div style={{ textAlign: "center", paddingTop: "40px" }}>

      <h2>Proctoring Verification</h2>
      <p>Camera and microphone must stay ON during the exam</p>

      {/* Draggable Camera */}
      <div
        onMouseDown={handleMouseDown}
        onClick={() => setExpanded(!expanded)}
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          cursor: "move",
          zIndex: 1000
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{
            width: expanded ? "350px" : "120px",
            height: expanded ? "260px" : "90px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            transition: "0.3s"
          }}
        />
      </div>

      <br /><br />

      {/* Start Button */}
      <button
        disabled={!ready}
onClick={() => navigate(`/student/exam/${id}`)}
        style={{
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          background: ready ? "#C5BAFF" : "#ccc",
          color: "white",
          cursor: ready ? "pointer" : "not-allowed"
        }}
      >
        Start Exam
      </button>

    </div>
  );
}