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

          setQuestions(
            data.questions.map((q) => ({
              ...q,
              id: q._id, // use MongoDB id
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

    const testData = {
      title: formTitle || "Untitled Test",
      description: formDescription || "",
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
          placeholder="Untitled Form"
          value={formTitle}
          disabled={isViewMode}
          onChange={(e) => setFormTitle(e.target.value)}
        />

        <input
          className="form-description"
          placeholder="Form description"
          value={formDescription}
          disabled={isViewMode}
          onChange={(e) => setFormDescription(e.target.value)}
        />
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
          {questions.map((q) => (
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

      {activeTab === "responses" && (
        <div className="responses-section">
          <h3>No responses yet</h3>
        </div>
      )}
    </div>
  );
}