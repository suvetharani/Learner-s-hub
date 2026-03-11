import { useRef, useState } from "react";
import { FaMinus, FaTimes, FaPlus } from "react-icons/fa";
import "../../styles/student/chatbot.css";

export default function Chatbot({ onClose, asPage = false }) {
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi 👋 I'm your AI tutor. Ask me any doubt about your courses, concepts, or exams.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [fileContext, setFileContext] = useState("");
  const fileInputRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const baseQuestion = input.trim();

    const enrichedText =
      fileContext && fileInfo
        ? `Here is context from an uploaded file named "${fileInfo.name}". Use it to answer the question.\n\n--- File content (may be truncated) ---\n${fileContext}\n\n--- Question ---\n${baseQuestion}`
        : baseQuestion;

    const userMessage = { from: "user", text: baseQuestion };
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
        body: JSON.stringify({
          messages: [...current, { from: "user", text: enrichedText }],
        }),
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

  const handleFileClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      // keep it reasonably small
      const trimmed = text.slice(0, 8000);
      setFileInfo({ name: file.name, size: file.size });
      setFileContext(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: `I have loaded the file "${file.name}". You can now ask doubts about its content.`,
        },
      ]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const renderText = (text) => {
    const blocks = text.split(/\n\n+/);
    return blocks.map((block, i) => {
      const lines = block.split("\n");
      return (
        <p key={i} style={{ margin: "4px 0", lineHeight: 1.5 }}>
          {lines.map((line, j) => (
            <span key={j}>
              {line}
              {j < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  const containerClass = `chatbot ${minimized ? "mini" : ""} ${
    asPage ? "chatbot-page" : ""
  }`;

  return (
    <div className={containerClass}>
      {/* HEADER */}
      <div className="chatbot-header">
        <span>AI Assistant</span>

        {!asPage && (
          <div className="actions">
            <FaMinus onClick={() => setMinimized(!minimized)} />
            <FaTimes onClick={onClose} />
          </div>
        )}
      </div>

      {/* BODY */}
      {!minimized && (
        <>
          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.from}`}>
                {renderText(m.text)}
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
            <button
              type="button"
              className="chatbot-plus"
              onClick={handleFileClick}
              disabled={loading}
            >
              <FaPlus />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
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
