import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StartExam() {

  const { id } = useParams();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchTest();
    detectTabSwitch();
  }, []);

  /* FETCH TEST + QUESTIONS */

  const fetchTest = async () => {
    try {

      const res = await fetch(`http://localhost:5000/api/tests/${id}`);
      const data = await res.json();

      setQuestions(data.questions);
      setTimeLeft(data.duration * 60);

    } catch (err) {
      console.log(err);
    }
  };

  /* TIMER */

  useEffect(() => {

    if (timeLeft <= 0) return;

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

  /* TAB SWITCH DETECTION */

  const detectTabSwitch = () => {

    document.addEventListener("visibilitychange", () => {

      if (document.hidden) {
        alert("Tab switching detected!");
      }

    });

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
        testId: id,
        answers
      })
    });

    alert("Exam submitted successfully");

  };

  if (questions.length === 0) return <p>Loading exam...</p>;

  const q = questions[current];

  return (
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

        {q.type === "mcq" && q.options.map((opt, i) => (

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
  );
}