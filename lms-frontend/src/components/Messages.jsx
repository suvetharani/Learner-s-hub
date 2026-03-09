import { useState, useEffect, useRef } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import { io } from "socket.io-client";
import "./messages.css";

export default function Messages() {
  const socket = useRef(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const fileInputRef = useRef();

  /* ================= SOCKET CONNECTION ================= */
  useEffect(() => {
    if (!currentUser?._id) return;

    socket.current = io("http://localhost:5000");

    socket.current.emit("addUser", currentUser._id);

    socket.current.on("receiveMessage", (data) => {
      if (
        selectedUser &&
        data.sender === selectedUser._id
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [currentUser]);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users/all");
    const data = await res.json();

    setUsers(
      data.filter((u) => u._id !== currentUser._id)
    );
  };

  /* ================= FETCH MESSAGES ================= */
  const fetchMessages = async () => {
    if (!selectedUser) return;

    const res = await fetch(
      `http://localhost:5000/api/messages/${currentUser._id}/${selectedUser._id}`
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!message.trim() && !image) return;

    const formData = new FormData();
    formData.append("senderId", currentUser._id);
    formData.append("receiverId", selectedUser._id);
    formData.append("text", message);
    if (image) formData.append("image", image);

    const res = await fetch("http://localhost:5000/api/messages/send", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Add message only once (sender side)
    setMessages((prev) => [...prev, data]);

if (socket.current) {
  socket.current.emit("sendMessage", {
    senderId: currentUser._id,
    receiverId: selectedUser._id,
    message: data,
  });
}

    setMessage("");
    setImage(null);
  };

  /* ================= DELETE SINGLE MESSAGE ================= */
  const deleteMessage = async (id) => {
    await fetch(`http://localhost:5000/api/messages/${id}`, {
      method: "DELETE",
    });

    setMessages((prev) =>
      prev.filter((msg) => msg._id !== id)
    );
  };

  return (
    <div className="messages-container">
      {/* ================= SIDEBAR ================= */}
      <div className="chat-sidebar">
        <h3>Messages</h3>

        {users.map((user) => (
          <div
            key={user._id}
            className="chat-user"
            onClick={() => setSelectedUser(user)}
          >
            <img
              src={
                user.profileImage
                  ? `http://localhost:5000/${user.profileImage}`
                  : "https://via.placeholder.com/40"
              }
              alt=""
              className="profile-img"
            />
            <span>{user.name}</span>
          </div>
        ))}
      </div>

      {/* ================= CHAT SECTION ================= */}
      {selectedUser && (
        <div className="chat-section">
          <div className="chat-header">
            <img
              src={
                selectedUser.profileImage
                  ? `http://localhost:5000/${selectedUser.profileImage}`
                  : "https://via.placeholder.com/40"
              }
              alt=""
              className="profile-img"
            />
            <h4>{selectedUser.name}</h4>
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
                {msg.text && <p>{msg.text}</p>}

                {msg.image && (
                  <img
                    src={`http://localhost:5000/${msg.image}`}
                    alt=""
                    className="chat-image"
                  />
                )}

                <FaTrash
                  className="delete-icon"
                  onClick={() => deleteMessage(msg._id)}
                />
              </div>
            ))}
          </div>

          {/* ================= INPUT SECTION ================= */}
          <div className="chat-input">
            <FaPlus
              className="plus-icon"
              onClick={() => fileInputRef.current.click()}
            />

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files[0])}
            />

            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />

            <button onClick={sendMessage}>Send</button>
          </div>

          {/* IMAGE PREVIEW BEFORE SEND */}
          {image && (
            <div className="image-preview">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="chat-image"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}