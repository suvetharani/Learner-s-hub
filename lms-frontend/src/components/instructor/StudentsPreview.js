import { useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";

function StudentsPreview() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/points/ranking"
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setStudents(data.slice(0, 3));
        }
      } catch {
        // ignore errors
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="box ranking">
      <div className="box-header">
        <h4>Top Students (Points)</h4>
      </div>

      {students.length === 0 ? (
        <p className="topic-content-hint">No ranking data yet.</p>
      ) : (
        students.map((s, index) => {
          return (
            <div
              key={s._id || s.name}
              className={`rank-row ${index === 0 ? "first" : ""}`}
            >
              <div className="rank-left">
                <span className="rank-number">#{index + 1}</span>
                <FaMedal className="medal-icon" />
                <span className="rank-name">{s.name}</span>
              </div>

              <div className="rank-score">{s.points || 0} pts</div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default StudentsPreview;
