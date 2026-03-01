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
    try {
      const res = await fetch(
        `http://localhost:5000/api/courses/${id}/materials`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMaterials(data);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="classroom-page">
      <h2>Course Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet</p>
      ) : (
        <div className="materials-grid">
          {materials.map((file, index) => (
            <div key={index} className="material-card">
              <h4>{file.fileName}</h4>

              <a
                href={`http://localhost:5000/${file.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>

              <a
                href={`http://localhost:5000/${file.fileUrl}`}
                download
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}