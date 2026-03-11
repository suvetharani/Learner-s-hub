import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import "../../styles/instructor/test.css";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateTest() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("questions");
  const [isViewMode, setIsViewMode] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(0);

  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      questionText: "",
      type: "short",
      required: false,
      options: ["Option 1"],
    },
  ]);

  // ✅ Load test from backend if ID exists
  useEffect(() => {
    if (id) {
      const fetchTest = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/tests/${id}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch test");
          }

          const data = await response.json();

          setFormTitle(data.title);
          setFormDescription(data.description);
          setDuration(data.duration || 30);
          setTotalMarks(data.totalMarks || 0);

setQuestions(
  data.questions.map((q, index) => ({
    id: q._id || index + 1, // fallback id
    questionText: q.questionText || "",
    type: q.type || "short",
    required: q.required || false,
    options: q.options?.length ? q.options : ["Option 1"],
  }))
);

          setIsViewMode(true);
        } catch (error) {
          console.error("Error loading test:", error);
        }
      };

      fetchTest();
    }
  }, [id]);

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        questionText: "",
        type: "short",
        required: false,
        options: ["Option 1"],
      },
    ]);
  };

  // Update question field
  const updateQuestion = (qid, field, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid ? { ...q, [field]: value } : q
      )
    );
  };

  // Add MCQ option
  const addOption = (qid) => {
    setQuestions(
      questions.map((q) =>
        q.id === qid
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q
      )
    );
  };

  // Delete question
  const deleteQuestion = (qid) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((q) => q.id !== qid));
  };

  // ✅ Save to backend
  const handleSave = async () => {
    const confirmSave = window.confirm(
      "Are you sure you want to finish and save this test?"
    );
    if (!confirmSave) return;

    if (!questions.length) {
      alert("Please add at least one question before saving.");
      return;
    }

    const testData = {
      title: formTitle || "Untitled Test",
      description: formDescription || "",
      duration: Number(duration) || 30,
      totalMarks:
        Number(totalMarks) || questions.length * 5,
      questions: questions.map(({ id, ...rest }) => rest),
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/tests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save test");
      }

      navigate("/instructor/test");
    } catch (error) {
      console.error("Error saving test:", error);
    }
  };

  return (
    <div className="builder-container">
      {/* HEADER */}
      <div className="form-header">
        <input
          className="form-title"
          placeholder="Test title"
          value={formTitle}
          disabled={isViewMode}
          onChange={(e) => setFormTitle(e.target.value)}
        />

        <input
          className="form-description"
          placeholder="Short description for students"
          value={formDescription}
          disabled={isViewMode}
          onChange={(e) => setFormDescription(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "14px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280" }}>
              Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              className="form-description"
              style={{ marginTop: 4, maxWidth: 140 }}
              value={duration}
              disabled={isViewMode}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#6b7280" }}>
              Total Marks
            </label>
            <input
              type="number"
              min="0"
              className="form-description"
              style={{ marginTop: 4, maxWidth: 140 }}
              value={totalMarks}
              disabled={isViewMode}
              onChange={(e) => setTotalMarks(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: "auto", fontSize: "12px", color: "#6b7280" }}>
            Questions: <strong>{questions.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "questions" ? "active" : ""}
          onClick={() => setActiveTab("questions")}
        >
          Questions
        </button>

        <button
          className={activeTab === "responses" ? "active" : ""}
          onClick={() => setActiveTab("responses")}
        >
          Responses
        </button>
      </div>

      {activeTab === "questions" && (
        <>
          {questions && questions.map((q) => (
            <div key={q.id} className="question-card">
              <div className="question-top">
                <input
                  className="question-input"
                  placeholder="Untitled Question"
                  value={q.questionText}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateQuestion(q.id, "questionText", e.target.value)
                  }
                />

                <select
                  value={q.type}
                  disabled={isViewMode}
                  onChange={(e) =>
                    updateQuestion(q.id, "type", e.target.value)
                  }
                >
                  <option value="short">Short answer</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="mcq">Multiple choice</option>
                </select>
              </div>

              {q.type === "short" && (
                <input disabled className="preview-input" />
              )}

              {q.type === "paragraph" && (
                <textarea disabled className="preview-input" />
              )}

              {q.type === "mcq" && (
                <div className="options-section">
                  {q.options.map((opt, index) => (
                    <input
                      key={index}
                      className="option-input"
                      value={opt}
                      disabled={isViewMode}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[index] = e.target.value;
                        updateQuestion(q.id, "options", newOptions);
                      }}
                    />
                  ))}

                  {!isViewMode && (
                    <button onClick={() => addOption(q.id)}>
                      + Add Option
                    </button>
                  )}
                </div>
              )}

              <div className="question-bottom">
                <label>
                  Required
                  <input
                    type="checkbox"
                    checked={q.required}
                    disabled={isViewMode}
                    onChange={(e) =>
                      updateQuestion(q.id, "required", e.target.checked)
                    }
                  />
                </label>

                {!isViewMode && (
                  <Trash2
                    size={18}
                    className="delete-icon"
                    onClick={() => deleteQuestion(q.id)}
                  />
                )}
              </div>
            </div>
          ))}

          {!isViewMode && (
            <>
              <button className="finish-btn" onClick={handleSave}>
                Finish Test Questions
              </button>

              <button className="floating-add" onClick={addQuestion}>
                +
              </button>
            </>
          )}
        </>
      )}

      {activeTab === "responses" && <ResponsesTab testId={id} questions={questions} />}
    </div>
  );
}

function ResponsesTab({ testId, questions }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!testId) return;

    const fetchResponses = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/tests/${testId}/responses`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setResponses(data);
        }
      } catch (err) {
        console.error("Error fetching responses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [testId]);

  if (!testId) {
    return (
      <div className="responses-section">
        <h3>Save the test first to view responses.</h3>
      </div>
    );
  }

  return (
    <div className="responses-section">
      <h3>Responses</h3>

      {loading && <p>Loading responses...</p>}

      {!loading && responses.length === 0 && (
        <p>No responses recorded yet.</p>
      )}

      {!loading &&
        responses.map((r) => (
          <div key={r._id} className="question-card">
            <div className="question-top">
              <div>
                <strong>{r.student?.name}</strong>{" "}
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  ({r.student?.rollNumber || r.student?.email})
                </span>
              </div>
              <div style={{ marginLeft: "auto", fontSize: 12 }}>
                {new Date(r.submittedAt).toLocaleString()}
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 13 }}>
              <p>
                Status:{" "}
                <strong>{r.terminated ? "Terminated" : "Submitted"}</strong>
              </p>

              <div style={{ marginTop: 10 }}>
                <h4 style={{ marginBottom: 6 }}>Answers</h4>
                {r.answers.map((a) => {
                  const q = questions[a.questionIndex];
                  return (
                    <div
                      key={a.questionIndex}
                      style={{
                        marginBottom: 8,
                        padding: 8,
                        borderRadius: 8,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        Q{a.questionIndex + 1}: {q?.questionText || ""}
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4 }}>
                        {a.answer}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 10 }}>
                <h4 style={{ marginBottom: 6 }}>Violations</h4>
                {(!r.violations || r.violations.length === 0) && (
                  <p style={{ fontSize: 13 }}>No violations recorded.</p>
                )}
                {r.violations &&
                  r.violations.map((v) => (
                    <div
                      key={v._id}
                      style={{
                        marginBottom: 6,
                        padding: 6,
                        borderRadius: 6,
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        fontSize: 12,
                      }}
                    >
                      <strong>{v.type}</strong> at{" "}
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}