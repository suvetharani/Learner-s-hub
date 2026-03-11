import { useEffect, useState } from "react";
import { FaMedal } from "react-icons/fa";

function Ranking() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/studytime/ranking"
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setStudents(data.slice(0, 3));
        }
      } catch {
        // ignore network errors
      }
    };

    fetchTop();
  }, []);

  if (!students.length) {
    return (
      <div className="box ranking">
        <h4 className="ranking-title">Top Students</h4>
        <p className="topic-content-hint">No ranking data yet.</p>
      </div>
    );
  }

  return (
    <div className="box ranking">
      <h4 className="ranking-title">Top Students</h4>

      {students.map((s, index) => {
        const hours = +(s.totalSeconds / 3600).toFixed(1);
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

            <div className="rank-score">{hours} h</div>
          </div>
        );
      })}
    </div>
  );
}

export default Ranking;
