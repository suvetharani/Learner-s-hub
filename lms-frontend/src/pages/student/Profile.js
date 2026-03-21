import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/student/profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(
        `http://localhost:5000/api/users/profile/${userId}`
      );
      const data = await res.json();
      setUser(data);
    };

    fetchProfile();
  }, [userId]);

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    await fetch(
      `http://localhost:5000/api/users/profile/image/${userId}`,
      {
        method: "PUT",
        body: formData
      }
    );

    window.location.reload();
  };

  const handleDeleteProfile = async () => {
    const confirmDelete = window.confirm(
      "Are you sure? This will permanently delete your profile and related data."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      alert("Unable to delete profile right now.");
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-image">
          <img
  src={
    user.profileImage
      ? `http://localhost:5000/${user.profileImage}`
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
  }
  alt="profile"
/>
        </div>

        <label className="upload-btn">
          Change Photo
          <input type="file" hidden onChange={handleImage} />
        </label>

        <div className="info-row">
          <span className="label">Name</span>
          <span className="value">{user.name}</span>
        </div>

        <div className="info-row">
          <span className="label">Email</span>
          <span className="value">{user.email}</span>
        </div>

        {user.role === "student" && (
          <div className="info-row">
            <span className="label">Roll Number</span>
            <span className="value">{user.rollNumber}</span>
          </div>
        )}

        {user.role === "admin" && (
          <>
            <div className="info-row">
              <span className="label">Degree</span>
              <span className="value">{user.degree}</span>
            </div>

            <div className="info-row">
              <span className="label">Specialization</span>
              <span className="value">{user.specialization}</span>
            </div>

            <div className="info-row">
              <span className="label">Experience</span>
              <span className="value">{user.experience} years</span>
            </div>

            <div className="info-row">
              <span className="label">Bio</span>
              <span className="value">{user.bio}</span>
            </div>
          </>
        )}

        <button
          className="upload-btn"
          style={{ marginTop: "16px", background: "#fee2e2", color: "#991b1b" }}
          onClick={handleDeleteProfile}
        >
          Delete Profile
        </button>

      </div>
    </div>
  );
}