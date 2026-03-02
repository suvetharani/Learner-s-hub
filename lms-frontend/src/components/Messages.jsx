import { useState, useEffect } from "react";
import { FaTrash, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import "./messages.css";

export default function Messages() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // ================= FETCH USERS =================
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users/all");
    const data = await res.json();

    // remove current user from list
    const filtered = data.filter(
      (user) => user._id !== currentUser?._id
    );

    setUsers(filtered);
  };

  // ================= FETCH MESSAGES =================
  useEffect(() => {
    if (selectedUser && currentUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  const fetchMessages = async () => {
    if (!selectedUser || !currentUser) return;

    const res = await fetch(
      `http://localhost:5000/api/messages/${currentUser._id}/${selectedUser._id}`
    );

    const data = await res.json();
    setMessages(data);
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!message.trim() || !selectedUser || !currentUser) return;

    const res = await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text: message,
      }),
    });

    const data = await res.json();
    setMessages([...messages, data]);
    setMessage("");
    setShowEmoji(false);
  };

  // ================= DELETE CHAT =================
  const deleteChat = async () => {
    if (!selectedUser) return;

    const confirmDelete = window.confirm("Delete this chat?");
    if (!confirmDelete) return;

    await fetch(
      `http://localhost:5000/api/messages/delete/${currentUser._id}/${selectedUser._id}`,
      { method: "DELETE" }
    );

    setMessages([]);
  };

  // ================= EMOJI SELECT =================
  const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="messages-container">
      {/* SIDEBAR */}
      <div className="chat-sidebar">
        <h3>Messages</h3>

        {users.map((user) => (
          <div
            key={user._id}
            className={`chat-user ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
            onClick={() => setSelectedUser(user)}
          >
            {user.name}
          </div>
        ))}
      </div>

      {/* CHAT SECTION */}
      {selectedUser && (
        <div className="chat-section">
          <div className="chat-header">
            <h4>{selectedUser.name}</h4>
            <FaTrash className="delete-icon" onClick={deleteChat} />
          </div>

          <div className="chat-body">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={
                  msg.sender === currentUser._id
                    ? "message sent"
                    : "message received"
                }
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <FaSmile
              className="emoji-icon"
              onClick={() => setShowEmoji(!showEmoji)}
            />

            {showEmoji && (
              <div className="emoji-picker">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}

            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}