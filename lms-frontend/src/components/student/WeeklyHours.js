import { useEffect, useMemo, useRef, useState } from "react";

const days = ["S", "M", "T", "W", "T", "F", "S"];

function getLast7Days() {
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push({
      key: d.toISOString().slice(0, 10),
      label: days[d.getDay()],
    });
  }

  return result;
}

function WeeklyHours() {
  const [dailySeconds, setDailySeconds] = useState({});
  const [loading, setLoading] = useState(true);

  const sessionStartRef = useRef(Date.now());

  const userId = useMemo(() => localStorage.getItem("userId"), []);

  // Fetch existing study time for the logged-in student
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/users/studytime/me/${userId}`
        );
        const data = await res.json();
        if (res.ok && data?.daily) {
          const map = {};
          data.daily.forEach((d) => {
            if (d?.date) {
              map[d.date] = d.seconds || 0;
            }
          });
          setDailySeconds(map);
        }
      } catch {
        // ignore errors, show empty chart
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Track this dashboard session and send it to backend when leaving
  useEffect(() => {
    if (!userId) return;

    const sendSession = () => {
      const now = Date.now();
      const seconds = Math.round((now - sessionStartRef.current) / 1000);
      if (seconds <= 0) return;

      const date = new Date().toISOString().slice(0, 10);

      fetch("http://localhost:5000/api/users/studytime/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, seconds, date }),
      }).catch(() => {
        // ignore network errors
      });

      // start a fresh segment after every upload
      sessionStartRef.current = Date.now();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendSession();
      }
    };

    window.addEventListener("beforeunload", sendSession);
    document.addEventListener("visibilitychange", handleVisibility);
    const intervalId = setInterval(sendSession, 60000);

    return () => {
      sendSession();
      window.removeEventListener("beforeunload", sendSession);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(intervalId);
    };
  }, [userId]);

  const daysConfig = getLast7Days();

  const minutesData = daysConfig.map(({ key }) => {
    const sec = dailySeconds[key] || 0;
    return Math.round(sec / 60);
  });

  const max = Math.max(...minutesData, 1);

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      return `${h}h ${m}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="weekly-card">
      <div className="weekly-header">
        <h4>Weekly Study Time</h4>
      </div>

      <div className="chart-area">
        {loading ? (
          <p className="topic-content-hint">Loading study time...</p>
        ) : (
          daysConfig.map(({ label }, i) => (
            <div key={i} className="bar-group">
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ height: `${(minutesData[i] / max) * 100}%` }}
                >
                  <span className="tooltip">{formatDuration(minutesData[i])}</span>
                </div>
              </div>

              <div className="day-label">{label}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default WeeklyHours;
