import { useState } from "react";
import { FaMinus, FaTimes, FaExpand, FaCompress } from "react-icons/fa";
import "../../styles/student/chatbot.css";

export default function Chatbot({ onClose }) {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi 👋 I'm your AI tutor. Ask me any doubt about your courses, concepts, or exams.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { from: "user", text: input.trim() };
    const current = [...messages, userMessage];

    setMessages(current);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/student-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: current }),
      });

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
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: err.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot ${minimized ? "mini" : ""} ${maximized ? "max" : ""}`}>
      {/* HEADER */}
      <div className="chatbot-header">
        <span>AI Assistant</span>

        <div className="actions">
          {maximized ? (
            <FaCompress onClick={() => setMaximized(false)} />
          ) : (
            <FaExpand onClick={() => setMaximized(true)} />
          )}
          <FaMinus onClick={() => setMinimized(!minimized)} />
          <FaTimes onClick={onClose} />
        </div>
      </div>

      {/* BODY */}
      {!minimized && (
        <>
          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="msg bot">
                Thinking...
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="chatbot-input">
            <input
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
