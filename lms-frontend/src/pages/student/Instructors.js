import "../../styles/student/instructors.css";

const instructors = [
  {
    name: "Dr. Arun Kumar",
    domain: "Machine Learning",
    degree: "PhD - AI",
    phone: "+91 9876543210",
    email: "arun@lms.com",
    image: "https://i.pravatar.cc/150?img=12",
  },
  {
    name: "Priya Sharma",
    domain: "Deep Learning",
    degree: "M.Tech - AI",
    phone: "+91 9876543211",
    email: "priya@lms.com",
    image: "https://i.pravatar.cc/150?img=32",
  },
  {
    name: "Rahul Verma",
    domain: "Ethical Hacking",
    degree: "M.Tech - Security",
    phone: "+91 9876543220",
    email: "rahul@lms.com",
    image: "https://i.pravatar.cc/150?img=5",
  },
];

export default function Instructors() {
  return (
    <div className="instructors-page">
      {instructors.map((ins, i) => (
        <div key={i} className="instructor-card">
          
          <img src={ins.image} alt={ins.name} />

          <h4>{ins.name}</h4>

          <p className="domain-name">{ins.domain}</p>

          <p className="info">{ins.degree}</p>
          <p className="info">{ins.phone}</p>
          <p className="info">{ins.email}</p>

          <div className="message-btn">💬</div>
        </div>
      ))}
    </div>
  );
}
