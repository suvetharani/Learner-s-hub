import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="box">
      <h4>Quick Actions</h4>

      <div className="quick-buttons">
        <button onClick={() => navigate("/instructor/course-creation")}>
          Upload Course
        </button>

        <button onClick={() => navigate("/instructor/test-creation")}>
          Upload Test
        </button>
      </div>
    </div>
  );
}

export default QuickActions;
