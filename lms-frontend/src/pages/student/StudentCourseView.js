import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentCourseView() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}/students`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const courseRes = await fetch(
        `http://localhost:5000/api/courses/instructor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const courses = await courseRes.json();
      const current = courses.find((c) => c._id === id);

      if (current) {
        setMaterials(current.materials || []);
      }
    }
  };

  return (
    <div className="classroom-page">
      <h2>Course Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet</p>
      ) : (
        materials.map((file, index) => (
          <div key={index} className="material-card">
            <h4>{file.fileName}</h4>

            <a
              href={`http://localhost:5000/${file.fileUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>
          </div>
        ))
      )}
    </div>
  );
}