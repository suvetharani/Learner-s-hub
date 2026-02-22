import { useParams } from "react-router-dom";

export default function MessagePage() {
  const { id } = useParams();

  return (
    <div style={{ padding: "40px" }}>
      <h2>Messaging Student</h2>
      <p>Student ID: {id}</p>

      {/* Later we can build full chat UI here */}
    </div>
  );
}