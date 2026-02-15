import { useState } from "react";
import "../../styles/instructor/ai.css";

function AIAssistant() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello Instructor 👋 How can I help you today?" },
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
    <div className="ai-page">
      {/* HEADER */}
      <div className="ai-header">Instructor AI Assistant</div>

      {/* CHAT AREA */}
      <div className="ai-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="ai-input">
        <input
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default AIAssistant;
