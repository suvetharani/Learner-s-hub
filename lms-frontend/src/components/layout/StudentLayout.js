import Sidebar from "../student/Sidebar";
import "../../styles/student/student.css";


function StudentLayout({ children }) {
return (
<div className="student-layout">
<Sidebar />
<div className="main">{children}</div>
</div>
);
}


export default StudentLayout;