import { useEffect, useState } from "react";
import "../../styles/student/ranking.css";

export default function Ranking() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/points/ranking"
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setStudents(data);
        }
      } catch {
        // ignore errors, show empty
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="ranking-page">
      <h2 className="title">🏆 Student Leaderboard</h2>

      {loading && <p className="topic-content-hint">Loading ranking...</p>}

      {!loading && !students.length && (
        <p className="empty">No points data available yet.</p>
      )}

      {!loading && students.length > 0 && (
        <div className="ranking-list">
          {students.map((s, i) => {
            return (
              <div
                key={s._id || s.name}
                className={`rank-card ${
                  i === 0 ? "first" : i === 1 ? "second" : i === 2 ? "third" : ""
                }`}
              >
                <div className="rank">#{i + 1}</div>

                <div className="info">
                  <h4>{s.name}</h4>
                </div>

                <div className="points">{s.points || 0} pts</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
