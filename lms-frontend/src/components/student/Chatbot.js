import { useState } from "react";
import { FaMinus, FaTimes } from "react-icons/fa";
import "../../styles/student/chatbot.css";

export default function Chatbot({ onClose }) {
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: "user", text: input },
      { from: "bot", text: "I will assist you with that." },
    ]);
    setInput("");
  };

  return (
    <div className={`chatbot ${minimized ? "mini" : ""}`}>
      {/* HEADER */}
      <div className="chatbot-header">
        <span>AI Assistant</span>

        <div className="actions">
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
          </div>

          {/* INPUT */}
          <div className="chatbot-input">
            <input
              placeholder="Type message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
}
