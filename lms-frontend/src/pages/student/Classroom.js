import { useNavigate } from "react-router-dom";
import "../../styles/student/classroom.css";

const batches = [
  { id: 1, name: "AI - Section A", instructor: "Dr. John" },
  { id: 2, name: "Data Structures", instructor: "Prof. Smith" },
  { id: 3, name: "Computer Networks", instructor: "Dr. Watson" },
];

export default function Classroom() {
  const navigate = useNavigate();

  return (
    <div className="classroom-page">
      <h2>Your Classroom</h2>

      <div className="batch-grid">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="batch-card"
            onClick={() => navigate(`/student/classroom/${batch.id}`)}
          >
            <h3>{batch.name}</h3>
            <p>{batch.instructor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
