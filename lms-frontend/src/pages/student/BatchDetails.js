import { useParams } from "react-router-dom";
import "../../styles/student/batchdetails.css";
import { FaFilePdf, FaFileWord } from "react-icons/fa";

const materials = {
  1: [
    { title: "Introduction to AI", file: "/files/1.pdf" },
    { title: "AI Notes", file: "/files/1.docx" },
  ],
  2: [{ title: "Stacks & Queues", file: "/files/2.pdf" }],
  3: [{ title: "OSI Model", file: "/files/3.pdf" }],
};

export default function BatchDetails() {
  const { id } = useParams();
  const docs = materials[id] || [];

  // helper
  const getType = (file) => file.split(".").pop().toLowerCase();

  return (
    <div className="batch-details-page">
      <h2 className="page-title">Study Materials</h2>

      {docs.length === 0 ? (
        <p className="empty">No files uploaded yet.</p>
      ) : (
        <div className="materials-grid">
          {docs.map((doc, index) => {
            const type = getType(doc.file);

            return (
              <a
                key={index}
                href={doc.file}
                target="_blank"
                rel="noreferrer"
                className={`material-card ${type}`}
              >
                <div className="icon">
                  {type === "pdf" ? <FaFilePdf /> : <FaFileWord />}
                </div>

                <div className="info">
                  <h4>{doc.title}</h4>
                  <p>{type.toUpperCase()} File</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
