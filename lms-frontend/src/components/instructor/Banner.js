function Banner() {
  const name = "Instructor";

  return (
    <div className="banner">
      <div className="banner-left">
        <h3 className="banner-title">Welcome back, {name} 👋</h3>
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
