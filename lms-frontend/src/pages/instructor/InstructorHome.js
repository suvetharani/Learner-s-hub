import { useState } from "react";
import Sidebar from "../../components/instructor/Sidebar";
import Header from "../../components/instructor/Header";
import Banner from "../../components/instructor/Banner";
import AnalyticsReport from "../../components/instructor/AnalyticsReport";
import "../../styles/instructor/instructor.css";
import "../../styles/instructor/studentlist.css";

// For Student Details
import "../../styles/instructor/studentdetails.css";


import { Routes, Route } from "react-router-dom";

/* pages */
import AIAssistant from "../../components/instructor/AIAssistant";
import StudentList from "./StudentList";
import StudentDetails from "./StudentDetails";
import Academics from "./Academics";
import Instructors from "./Instructors";
import Classroom from "./Classroom";
import CourseCreation from "./CourseCreation";
import TestCreation from "./TestCreation";
import Messages from "./Messages";
import Notes from "./Notes";
import Ranking from "./Ranking";
import Notifications from "./Notifications";
import Profile from "./Profile";

/* ✅ NEW BOXES */
import StudentsPreview from "../../components/instructor/StudentsPreview";
import QuickActions from "../../components/instructor/QuickActions";

function InstructorHome() {
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
          {/* ================= DASHBOARD ================= */}
          <Route
            index
            element={
              <>
                <Banner />
                <AnalyticsReport />

                {/* BOTTOM GRID LIKE STUDENT */}
                <div className="bottom-grid">
                  <StudentsPreview />
                  <QuickActions />
                </div>
              </>
            }
          />

          {/* ================= OTHER PAGES ================= */}
          <Route path="ai" element={<AIAssistant />} />
          <Route path="StudentList" element={<StudentList />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="academics" element={<Academics />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="classroom" element={<Classroom />} />
          <Route path="course-creation" element={<CourseCreation />} />
          <Route path="test-creation" element={<TestCreation />} />
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

export default InstructorHome;
