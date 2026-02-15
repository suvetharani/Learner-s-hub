function AnalyticsReport() {
  return (
    <div className="analytics">
      <h3 className="analytics-title">Analytical Report</h3>

      <div className="analytics-grid">
        <div className="analytics-card">
          <p>Total Enrollments</p>
          <h2>120</h2>
        </div>

        <div className="analytics-card">
          <p>Average Attendance</p>
          <h2>87%</h2>
        </div>

        <div className="analytics-card">
          <p>Assignments Submitted</p>
          <h2>64</h2>
        </div>

        <div className="analytics-card">
          <p>Tests Completed</p>
          <h2>32</h2>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsReport;
