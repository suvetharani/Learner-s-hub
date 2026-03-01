import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentCourseDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    const res = await fetch(
      `http://localhost:5000/api/courses/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setMaterials(data.materials || []);
  };

  return (
    <div>
      <h2>Course Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet</p>
      ) : (
        materials.map((file, index) => (
          <div key={index}>
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