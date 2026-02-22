import { useEffect, useState } from "react";
import "../../styles/student/instructors.css";

export default function Instructors() {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/instructors");
        const data = await res.json();
        setInstructors(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchInstructors();
  }, []);

  return (
    <div className="instructors-page">
      {instructors.map((ins) => (
        <div key={ins._id} className="instructor-card">
<img
  src={
    ins.profileImage
      ? ins.profileImage.startsWith("uploads/")
        ? `http://localhost:5000/${ins.profileImage}`
        : `http://localhost:5000/uploads/${ins.profileImage}`
      : "https://via.placeholder.com/150"
  }
  alt={ins.name}
/>


          <h4>{ins.name}</h4>

          <p className="domain-name">{ins.specialization}</p>

          <p className="info">{ins.degree}</p>
          <p className="info">{ins.email}</p>

          <div className="message-btn">💬</div>
        </div>
      ))}
    </div>
  );
}