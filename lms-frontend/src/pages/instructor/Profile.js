import { useState } from "react";
import "../../styles/student/profile.css";

export default function Profile() {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("Suve");
  const [email, setEmail] = useState("suve@email.com");

  const [editName, setEditName] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* IMAGE */}
        <div className="profile-image">
          <img
            src={
              image ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
          />
        </div>

        {/* FILE INPUT */}
        <label className="upload-btn">
          Choose Photo
          <input type="file" hidden onChange={handleImage} />
        </label>

        {/* USERNAME */}
        <div className="info-row">
          <span className="label">Username</span>

          {editName ? (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="edit-input"
            />
          ) : (
            <span className="value">{username}</span>
          )}

          <button
            className="edit-btn"
            onClick={() => setEditName(!editName)}
          >
            {editName ? "Save" : "Edit"}
          </button>
        </div>

        {/* EMAIL */}
        <div className="info-row">
          <span className="label">Email</span>

          {editEmail ? (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="edit-input"
            />
          ) : (
            <span className="value">{email}</span>
          )}

          <button
            className="edit-btn"
            onClick={() => setEditEmail(!editEmail)}
          >
            {editEmail ? "Save" : "Edit"}
          </button>
        </div>
      </div>
    </div>
  );
}
