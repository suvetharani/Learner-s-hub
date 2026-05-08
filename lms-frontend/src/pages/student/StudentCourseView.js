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
        `${process.env.REACT_APP_API_URL}/api/courses/${id}/materials`,
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
                href={`${process.env.REACT_APP_API_URL}/${file.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                View
              </a>

              <a
                href={`${process.env.REACT_APP_API_URL}/${file.fileUrl}`}
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