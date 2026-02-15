import "../../styles/student/ranking.css";

const students = [
  { name: "Arun Kumar", points: 980 },
  { name: "Priya Sharma", points: 920 },
  { name: "Rahul Verma", points: 900 },
  { name: "Sneha Reddy", points: 870 },
  { name: "Karthik M", points: 860 },
  { name: "Meena Das", points: 830 },
  { name: "Vikram Rao", points: 810 },
  { name: "Anjali N", points: 790 },
  { name: "Rohit S", points: 760 },
  { name: "Divya P", points: 740 },
];

export default function Ranking() {
  return (
    <div className="ranking-page">
      <h2 className="title">🏆 Student Leaderboard</h2>

      <div className="ranking-list">
        {students.map((s, i) => (
          <div
            key={i}
            className={`rank-card ${
              i === 0 ? "first" : i === 1 ? "second" : i === 2 ? "third" : ""
            }`}
          >
            {/* Rank */}
            <div className="rank">#{i + 1}</div>

            {/* Name */}
            <div className="info">
              <h4>{s.name}</h4>
            </div>

            {/* Points badge */}
            <div className="points">{s.points} pts</div>
          </div>
        ))}
      </div>
    </div>
  );
}
