import { useEffect, useState } from "react";

function AnalyticsReport() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [testsCompleted, setTestsCompleted] = useState(0);
  const [topPoints, setTopPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // total enrolled students (approved)
        const studentsRes = await fetch(
          "http://localhost:5000/api/users/students/approved"
        );
        if (studentsRes.ok) {
          const students = await studentsRes.json();
          setTotalStudents(Array.isArray(students) ? students.length : 0);
        }
      } catch {
        // ignore errors, keep defaults
      }

      try {
        const statsRes = await fetch(
          "http://localhost:5000/api/tests/stats/summary"
        );
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setTestsCompleted(stats.resultsCount || 0);
        }
      } catch {
        // ignore errors, keep defaults
      }

      try {
        const pointsRes = await fetch(
          "http://localhost:5000/api/users/points/ranking"
        );
        if (pointsRes.ok) {
          const ranking = await pointsRes.json();
          setTopPoints(ranking?.[0]?.points || 0);
        }
      } catch {
        // ignore errors
      }
    };

    fetchData();
  }, []);

  return (
    <div className="analytics">
      <h3 className="analytics-title">Analytical Report</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <p>Total Enrollments</p>
          <h2>{totalStudents}</h2>
        </div>

        <div className="analytics-card">
          <p>Tests Completed</p>
          <h2>{testsCompleted}</h2>
        </div>

        <div className="analytics-card">
          <p>Top Student Points</p>
          <h2>{topPoints} pts</h2>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsReport;
