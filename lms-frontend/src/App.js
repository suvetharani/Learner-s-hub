import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentHome from "./pages/student/StudentHome";
import InstructorHome from "./pages/instructor/InstructorHome";
import GlobalNotificationListener from "./components/GlobalNotificationListener";


function App() {
  return (
    <BrowserRouter>
      <GlobalNotificationListener />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/student/*" element={<StudentHome />} />
        <Route path="/instructor/*" element={<InstructorHome />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;