import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "../../styles/instructor/attendance-calendar.css";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

function StudentAttendanceCalendar() {
  const { id } = useParams();
  const [studentName, setStudentName] = useState("Student");
  const [dailyMap, setDailyMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [profileRes, studyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/profile/${id}`),
          fetch(`http://localhost:5000/api/users/studytime/me/${id}`)
        ]);

        const profile = await profileRes.json().catch(() => ({}));
        const study = await studyRes.json().catch(() => ({}));

        if (profileRes.ok && profile?.name) setStudentName(profile.name);

        const map = {};
        if (studyRes.ok && Array.isArray(study?.daily)) {
          study.daily.forEach((d) => {
            if (d?.date) map[d.date] = Number(d.seconds) || 0;
          });
        }
        setDailyMap(map);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const monthLabel = useMemo(() => {
    return monthCursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [monthCursor]);

  const calendarCells = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const leadingBlankCount = first.getDay();

    const cells = [];
    for (let i = 0; i < leadingBlankCount; i++) {
      cells.push({ type: "blank", key: `b-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const iso = toISODate(d);
      cells.push({
        type: "day",
        key: iso,
        day,
        iso,
        seconds: dailyMap[iso] || 0
      });
    }

    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const trailing = 7 - remainder;
      for (let i = 0; i < trailing; i++) {
        cells.push({ type: "blank", key: `t-${i}` });
      }
    }

    return cells;
  }, [monthCursor, dailyMap]);

  return (
    <div className="attendance-cal-page">
      <div className="attendance-cal-top">
        <div className="attendance-cal-title">
          <div className="attendance-cal-student">{studentName}</div>
          <div className="attendance-cal-subtitle">App usage duration by date</div>
        </div>

        <div className="attendance-cal-controls">
          <button
            type="button"
            className="attendance-cal-btn"
            onClick={() =>
              setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
            }
          >
            Prev
          </button>
          <div className="attendance-cal-month">{monthLabel}</div>
          <button
            type="button"
            className="attendance-cal-btn"
            onClick={() =>
              setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
            }
          >
            Next
          </button>
        </div>
      </div>

      {loading ? (
        <div className="attendance-cal-loading">Loading...</div>
      ) : (
        <div className="attendance-cal-card">
          <div className="attendance-cal-weekdays">
            {weekDays.map((w) => (
              <div key={w} className="attendance-cal-weekday">
                {w}
              </div>
            ))}
          </div>

          <div className="attendance-cal-grid">
            {calendarCells.map((cell) =>
              cell.type === "blank" ? (
                <div key={cell.key} className="attendance-cal-cell blank" />
              ) : (
                <div
                  key={cell.key}
                  className={`attendance-cal-cell ${cell.seconds > 0 ? "used" : "unused"}`}
                  title={`${cell.iso} • ${formatDuration(cell.seconds)}`}
                >
                  <div className="attendance-cal-daynum">{cell.day}</div>
                  <div className="attendance-cal-duration">
                    {formatDuration(cell.seconds)}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAttendanceCalendar;
