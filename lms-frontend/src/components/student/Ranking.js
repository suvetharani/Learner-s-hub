import { FaMedal } from "react-icons/fa";

const students = [
  { name: "Arjun", score: 95 },
  { name: "Meena", score: 92 },
  { name: "Ravi", score: 89 },
];

function Ranking() {
  return (
    <div className="box ranking">
      <h4 className="ranking-title">Top Students</h4>

      {students.map((s, index) => (
        <div
          key={s.name}
          className={`rank-row ${index === 0 ? "first" : ""}`}
        >
          {/* LEFT */}
          <div className="rank-left">
            <span className="rank-number">#{index + 1}</span>
            <FaMedal className="medal-icon" />
            <span className="rank-name">{s.name}</span>
          </div>

          {/* RIGHT */}
          <div className="rank-score">{s.score}</div>
        </div>
      ))}
    </div>
  );
}

export default Ranking;
