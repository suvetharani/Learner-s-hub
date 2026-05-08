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
      `${process.env.REACT_APP_API_URL}/api/courses/${id}`,
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
              href={`${process.env.REACT_APP_API_URL}/${file.fileUrl}`}
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