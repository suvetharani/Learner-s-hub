const data = [3, 2, 5, 4, 6, 1, 0];
const days = ["M", "T", "W", "T", "F", "S", "S"];

function WeeklyHours() {
  const max = Math.max(...data);

  return (
    <div className="weekly-card">
      <div className="weekly-header">
        <h4>Weekly Study Hours</h4>
      </div>

      <div className="chart-area">
        {data.map((h, i) => (
          <div key={i} className="bar-group">
            
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${(h / max) * 100}%` }}
              >
                {/* ⭐ tooltip */}
                <span className="tooltip">{h}h</span>
              </div>
            </div>

            <div className="day-label">{days[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyHours;
