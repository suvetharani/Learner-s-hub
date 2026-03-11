import { useState } from "react";
import "../../styles/instructor/ai.css";

const quickActions = [
  "Explain this topic in simple terms.",
  "Generate 5 MCQ questions on this concept.",
  "Suggest an assignment idea for this course.",
  "Help me design a quiz for next week.",
];

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello Instructor 👋 I can help with explanations, test ideas, feedback, and student insights.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [analyticsName, setAnalyticsName] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;

    const userMessage = { from: "user", text };
    const current = [...messages, userMessage];

    setMessages(current);
    setInput("");
    setLoading(true);

    // Try instructor-specific endpoint first, then fall back to student-chat if it fails
    try {
      const res = await fetch(
        "http://localhost:5000/api/ai/instructor-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: current }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.message ||
          "AI is temporarily unavailable. Please try again later.";
        throw new Error(msg);
      }

      const replyText =
        data.reply ||
        "I'm having trouble generating a response right now. Please try again.";

      setMessages((prev) => [...prev, { from: "bot", text: replyText }]);
    } catch (err) {
      console.error("AI assistant error:", err);
      // Fallback: use the student tutor endpoint so instructor still gets help
      try {
        const res2 = await fetch(
          "http://localhost:5000/api/ai/student-chat",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: current }),
          }
        );
        const data2 = await res2.json().catch(() => ({}));
        if (!res2.ok) {
          const msg2 =
            data2?.message ||
            "AI is temporarily unavailable. Please try again later.";
          throw new Error(msg2);
        }
        const replyText2 =
          data2.reply ||
          "I'm having trouble generating a response right now. Please try again.";
        setMessages((prev) => [...prev, { from: "bot", text: replyText2 }]);
      } catch (fallbackErr) {
        console.error("AI assistant fallback error:", fallbackErr);
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: fallbackErr.message,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (text) => {
    setInput(text);
    sendMessage(text);
  };

  const loadAnalytics = async () => {
    if (!analyticsName.trim()) return;

    setLoadingAnalytics(true);
    setAnalytics(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/ai/instructor/student-analytics?q=${encodeURIComponent(
          analyticsName.trim()
        )}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load analytics");
      }

      setAnalytics(data);
    } catch (err) {
      console.error("Analytics error:", err);
      setAnalytics({
        error:
          "Could not load analytics for this student. Please check the name or try again.",
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return (
    <div className="ai-page">
      {/* HEADER */}
      <div className="ai-header">Instructor AI Assistant</div>

      {/* ANALYTICS + QUICK ACTIONS SECTION */}
      <div
        style={{
          padding: "10px 20px",
          background: "white",
          borderBottom: "1px solid #eee",
        }}
      >
        {/* Student analytics */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Student analytics:
          </span>
          <input
            placeholder="Enter student name / roll / email"
            value={analyticsName}
            onChange={(e) => setAnalyticsName(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              padding: "6px 8px",
              fontSize: 13,
            }}
          />
          <button
            onClick={loadAnalytics}
            disabled={loadingAnalytics}
            style={{
              border: "none",
              background: "#4caf50",
              color: "white",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {loadingAnalytics ? "Loading..." : "View report"}
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {quickActions.map((qa) => (
            <button
              key={qa}
              onClick={() => handleQuickAction(qa)}
              style={{
                border: "none",
                background: "#eef2ff",
                color: "#374151",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {qa}
            </button>
          ))}
        </div>

        {/* Analytics summary */}
        {analytics && (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              fontSize: 13,
            }}
          >
            {analytics.error ? (
              <div>{analytics.error}</div>
            ) : (
              <>
                <div style={{ marginBottom: 6 }}>
                  <strong>{analytics.student.name}</strong>{" "}
                  <span style={{ color: "#6b7280" }}>
                    ({analytics.student.rollNumber || analytics.student.email})
                  </span>
                </div>
                <div>
                  <strong>Courses:</strong>{" "}
                  {analytics.courses.length
                    ? analytics.courses.map((c) => c.name).join(", ")
                    : "No courses enrolled."}
                </div>
                <div>
                  <strong>Tests taken:</strong> {analytics.tests.attempts} (
                  {analytics.tests.uniqueTests} unique,{" "}
                  {analytics.tests.terminated} terminated)
                </div>
                <div>
                  <strong>Violations:</strong> {analytics.violations.total}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CHAT AREA */}
      <div className="ai-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="msg bot">Thinking...</div>}
      </div>

      {/* INPUT */}
      <div className="ai-input">
        <input
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default AIAssistant;
