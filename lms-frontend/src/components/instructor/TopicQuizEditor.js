import { useEffect, useState } from "react";
import "../../styles/student/topic-quiz.css";

const RAW_API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const trimmedApiBase = String(RAW_API_BASE || "").replace(/\/+$/, "");
const API_BASE = trimmedApiBase.endsWith("/api")
  ? trimmedApiBase
  : `${trimmedApiBase}/api`;

const emptyQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
});

export default function TopicQuizEditor({ courseId, topicId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  const load = async (opts = {}) => {
    const silent = opts.silent === true;
    if (!silent) {
      setLoading(true);
    }
    if (!silent) setMessage("");
    try {
      const res = await fetch(
        `${API_BASE}/topic-quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}`
      );
      if (res.status === 404) {
        setQuestions([emptyQuestion()]);
      } else if (res.ok) {
        const data = await res.json();
        const qs = Array.isArray(data.questions) ? data.questions : [];
        if (qs.length === 0) setQuestions([emptyQuestion()]);
        else {
          setQuestions(
            qs.map((q) => ({
              questionText: q.questionText || "",
              options:
                Array.isArray(q.options) && q.options.length >= 2
                  ? [...q.options, "", "", "", ""].slice(0, 6)
                  : ["", "", "", ""],
              correctAnswer: q.correctAnswer || "",
            }))
          );
        }
      } else {
        const errBody = await res.json().catch(() => ({}));
        setMessage(errBody.message || `Unable to load quiz (${res.status}).`);
      }
    } catch {
      setQuestions([emptyQuestion()]);
      setMessage("Unable to reach API — check backend is running on port 5000.");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when topic/course changes only
  }, [courseId, topicId]);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (qi) => {
    setQuestions((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== qi)));
  };

  const updateQuestion = (qi, patch) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, ...patch } : q))
    );
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((o, idx) => (idx === oi ? value : o)),
            }
          : q
      )
    );
  };

  const saveQuiz = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((o) => String(o || "").trim()).filter(Boolean),
        correctAnswer: String(q.correctAnswer || "").trim(),
      }));

      const valid = [];
      for (let i = 0; i < payload.length; i++) {
        const row = payload[i];
        if (!row.questionText) {
          setMessage(`Question ${i + 1} needs wording.`);
          setSaving(false);
          return;
        }
        if (row.options.length < 2) {
          setMessage(`Question ${i + 1} needs at least two options filled in.`);
          setSaving(false);
          return;
        }
        if (!row.correctAnswer || !row.options.includes(row.correctAnswer)) {
          setMessage(`Question ${i + 1}: pick the radio that matches one of your options exactly.`);
          setSaving(false);
          return;
        }
        valid.push(row);
      }

      const res = await fetch(
        `${API_BASE}/topic-quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: valid }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.message || `Save failed (${res.status}). Is the API running and MongoDB connected?`);
        return;
      }
      await load({ silent: true });
      setMessage(
        `Saved to database (${valid.length} question(s)). Questions, options, and correct keys are in MongoDB. Students see questions and choices only; if answers are wrong they must attempt again to finish the topic.`
      );
    } catch {
      setMessage("Network error saving quiz.");
    } finally {
      setSaving(false);
    }
  };

  const deleteQuiz = async () => {
    if (
      !window.confirm(
        "Remove this quiz? Students without a quiz will count the topic complete after viewing the page."
      )
    )
      return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(
        `${API_BASE}/topic-quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        await load({ silent: true });
        setMessage("Quiz removed from this topic in the database.");
      } else setMessage("Could not remove quiz.");
    } catch {
      setMessage("Network error removing quiz.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="topic-quiz-editor">
        <p className="topic-quiz-empty">Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="topic-quiz-editor">
      <h3>Topic quiz (MCQ)</h3>
      <p className="topic-quiz-hint">
        <strong>Admin / instructor:</strong> Students only see the questions and answer choices you save
        here—never the correct key. On the student topic page they submit the quiz; if anything is wrong,
        they are asked to attempt the quiz again until all answers match.
      </p>
      <p className="topic-quiz-hint">
        Build multi-choice checks. Students can retry endlessly; each answer must match your
        selected key before the topic counts as complete on their progress bar.
      </p>
      {!!message && (
        <p className={message.includes("failed") ? "topic-quiz-msg-fail" : "topic-quiz-hint"}>
          {message}
        </p>
      )}
      {questions.map((q, qi) => (
        <div key={qi} className="topic-quiz-q-block">
          <div className="topic-quiz-editor-row">
            <label htmlFor={`qtext-${qi}`}>Question {qi + 1}</label>
            <textarea
              id={`qtext-${qi}`}
              value={q.questionText}
              onChange={(e) => updateQuestion(qi, { questionText: e.target.value })}
            />
          </div>
          {(q.options || []).map((opt, oi) => (
            <div key={oi} className="topic-quiz-option-row">
              <label style={{ minWidth: 90, margin: 0, fontWeight: 500 }}>{`Option ${oi + 1}`}</label>
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(qi, oi, e.target.value)}
              />
            </div>
          ))}
          <div className="topic-quiz-editor-row">
            <span style={{ fontSize: 13, fontWeight: 600 }}>Correct answer</span>
            <div className="topic-quiz-options">
              {(q.options || []).map((opt, oi) => {
                const val = opt.trim();
                if (!val) return null;
                const id = `correct-${qi}-${oi}`;
                return (
                  <label key={oi} htmlFor={id}>
                    <input
                      id={id}
                      type="radio"
                      name={`correct-${qi}`}
                      checked={q.correctAnswer === val}
                      onChange={() => updateQuestion(qi, { correctAnswer: val })}
                    />
                    <span>{val}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="topic-quiz-editor-actions">
            <button type="button" className="topic-quiz-btn-danger" onClick={() => removeQuestion(qi)}>
              Remove question
            </button>
          </div>
        </div>
      ))}
      <div className="topic-quiz-editor-actions">
        <button type="button" className="topic-quiz-submit" onClick={addQuestion}>
          Add question
        </button>
        <button type="button" className="topic-quiz-submit" disabled={saving} onClick={saveQuiz}>
          {saving ? "Saving..." : "Save quiz"}
        </button>
        <button type="button" className="topic-quiz-btn-secondary" disabled={saving} onClick={deleteQuiz}>
          Remove quiz entirely
        </button>
      </div>
    </div>
  );
}
