import { useEffect, useRef, useState } from "react";

const RAW_API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const trimmedApiBase = String(RAW_API_BASE || "").replace(/\/+$/, "");
const API_BASE = trimmedApiBase.endsWith("/api")
  ? trimmedApiBase
  : `${trimmedApiBase}/api`;

/**
 * Student-facing topic quiz: questions and options are always shown; unlimited retries until all correct.
 */
export default function TopicQuizPanel({
  courseId,
  topicId,
  quiz,
  readTopicComplete,
  onPassed,
  onEvaluated,
}) {
  const questions = quiz?.questions || [];
  const [selections, setSelections] = useState(() =>
    Array(questions.length).fill("")
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    setSelections(Array(questions.length).fill(""));
    setFeedback(null);
  }, [courseId, topicId, questions.length]);

  useEffect(() => {
    if (feedback && feedback.ok === false && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [feedback]);

  if (!questions.length) return null;

  const answeredAll = selections.every((s) => String(s || "").trim().length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answeredAll || submitting) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(
        `${API_BASE}/topic-quiz/${encodeURIComponent(courseId)}/${encodeURIComponent(topicId)}/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: selections }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (onEvaluated) {
          onEvaluated({ submitted: true, passed: false, correctCount: 0, total: questions.length });
        }
        setFeedback({
          ok: false,
          summary: data.message || "Unable to check your answers.",
          needsRetry: true,
        });
        return;
      }
      if (data.passed) {
        if (onEvaluated) {
          onEvaluated({
            submitted: true,
            passed: true,
            correctCount: data.correctCount ?? data.total ?? questions.length,
            total: data.total ?? questions.length,
          });
        }
        setFeedback({
          ok: true,
          summary: `All ${data.total} questions answered correctly. This topic is marked complete.`,
          needsRetry: false,
        });
        if (onPassed) await onPassed();
      } else {
        if (onEvaluated) {
          onEvaluated({
            submitted: true,
            passed: false,
            correctCount: data.correctCount ?? 0,
            total: data.total ?? questions.length,
          });
        }
        setFeedback({
          ok: false,
          summary: `You got ${data.correctCount} of ${data.total} correct.`,
          needsRetry: true,
        });
      }
    } catch {
      if (onEvaluated) {
        onEvaluated({ submitted: true, passed: false, correctCount: 0, total: questions.length });
      }
      setFeedback({
        ok: false,
        summary: "Could not reach the server. Please try submitting again.",
        needsRetry: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className="topic-quiz-card"
      id="topic-quiz-panel"
      aria-labelledby="topic-quiz-heading"
    >
      <h3 id="topic-quiz-heading">Topic quiz (for students)</h3>
      <p className="topic-quiz-lead">
        Each question shows the full prompt and every option below it. Choose one answer per question, then
        submit. The correct answers are not shown—if your submission is not fully correct, you must attempt
        the quiz again until all answers are correct for this topic to count as done.
      </p>
      <p className="topic-quiz-hint">
        Tip: You can change your choices and press <strong>Submit quiz</strong> again as many times as you need.
      </p>
      {readTopicComplete && (
        <p className="topic-quiz-badge-done" role="status">
          Topic quiz passed — counted toward course progress
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        {questions.map((q, qi) => (
          <fieldset key={qi} className="topic-quiz-question" disabled={submitting}>
            <legend className="topic-quiz-legend">
              Question {qi + 1}
            </legend>
            <p className="topic-quiz-question-text">{q.questionText}</p>
            <p className="topic-quiz-options-label">Choose one answer:</p>
            <div className="topic-quiz-options" role="radiogroup" aria-label={`Question ${qi + 1} options`}>
              {(q.options || []).map((opt, oi) => {
                const id = `q${qi}-opt${oi}`;
                return (
                  <label key={oi} htmlFor={id}>
                    <input
                      id={id}
                      type="radio"
                      name={`topic-q-${qi}`}
                      value={opt}
                      checked={selections[qi] === opt}
                      disabled={submitting}
                      onChange={() => {
                        const next = [...selections];
                        next[qi] = opt;
                        setSelections(next);
                      }}
                    />
                    <span className="topic-quiz-option-text">{opt}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {feedback && !feedback.ok && feedback.needsRetry && (
          <div ref={feedbackRef} className="topic-quiz-retry-alert" role="alert">
            <strong>Not all answers are correct.</strong>
            <p className="topic-quiz-retry-msg">
              {feedback.summary} Please review the topic content, change your answers above, and submit again.
              You must answer every question correctly for this topic to count toward your course completion—keep
              attempting until the quiz is fully correct.
            </p>
          </div>
        )}

        {feedback && feedback.ok && (
          <p className="topic-quiz-msg-pass" role="status">
            {feedback.summary}
          </p>
        )}

        {feedback && !feedback.ok && !feedback.needsRetry && (
          <p className="topic-quiz-msg-fail" role="alert">
            {feedback.summary}
          </p>
        )}

        <div className="topic-quiz-actions">
          <button type="submit" className="topic-quiz-submit" disabled={!answeredAll || submitting}>
            {submitting ? "Checking…" : "Submit quiz"}
          </button>
        </div>
      </form>
    </section>
  );
}
