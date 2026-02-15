import { useState } from "react";
import Sidebar from "../../components/student/Sidebar";
import Header from "../../components/student/Header";
import Banner from "../../components/student/Banner";
import CurrentCourses from "../../components/student/CurrentCourses";
import RankingBox from "../../components/student/Ranking";
import WeeklyHours from "../../components/student/WeeklyHours";

import { Routes, Route } from "react-router-dom";

import Academics from "./Academics";
import Courses from "./Courses";
import Instructors from "./Instructors";
import Classroom from "./Classroom";
import BatchDetails from "./BatchDetails";   // ✅ NEW
import Messages from "./Messages";
import Notes from "./Notes";
import Ranking from "./Ranking";

import Notifications from "./Notifications";
import Profile from "./Profile";


import "../../styles/student/student.css";

function StudentHome() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="student-layout">
      {/* SIDEBAR */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* MAIN */}
      <div className="main">
        {/* HEADER */}
        <Header setIsOpen={setIsOpen} />

        <Routes>
          {/* ================= DASHBOARD (HOME) ================= */}
          <Route
            index
            element={
              <>
                <Banner />
                <CurrentCourses />

                <div className="bottom-grid">
                  <RankingBox />
                  <WeeklyHours />
                </div>
              </>
            }
          />

          {/* ================= OTHER PAGES ================= */}
          <Route path="academics" element={<Academics />} />
          <Route path="courses" element={<Courses />} />
          <Route path="instructors" element={<Instructors />} />

          {/* Classroom */}
          <Route path="classroom" element={<Classroom />} />
          <Route path="classroom/:id" element={<BatchDetails />} /> {/* ✅ */}

          <Route path="messages" element={<Messages />} />
          <Route path="notes" element={<Notes />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />

        </Routes>
      </div>
    </div>
  );
}

export default StudentHome;
