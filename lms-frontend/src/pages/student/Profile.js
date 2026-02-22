import { useEffect, useState } from "react";
import "../../styles/student/profile.css";

export default function Profile() {
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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="profile-image">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000/uploads/${user.profileImage}`
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

      </div>
    </div>
  );
}