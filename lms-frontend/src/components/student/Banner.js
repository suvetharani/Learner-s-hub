import { useEffect, useState } from "react";

function Banner() {
  const [name, setName] = useState("Student");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) {
          setName(parsed.name);
        }
      }
    } catch {
      // ignore parsing/localStorage errors
    }
  }, []);

  return (
    <div className="banner">
      <div className="banner-left">
        <h3 className="banner-title">Welcome, {name} 👋</h3>
        <p className="banner-sub">
          Dates, new assignments and your progress are all in one tap.
        </p>
      </div>

      <div className="banner-right">
        <img src="/student/3.png" alt="student" />
      </div>
    </div>
  );
}

export default Banner;
