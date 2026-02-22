import { useEffect, useRef, useState } from "react";
import "../../styles/student/notes.css";

const initialNotes = [
  {
    title: "Introduction to AI",
    content:
      "Artificial Intelligence is the simulation of human intelligence by machines.",
  },
  {
    title: "Data Structures Basics",
    content:
      "Data structures help organize data efficiently like arrays, stacks, and queues.",
  },
  {
    title: "Computer Networks",
    content:
      "A computer network allows systems to share information and resources.",
  },
];

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const modalRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  // LOAD NOTES (sidebar + defaults)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("notes"));
    if (stored && stored.length > 0) setNotes(stored);
    else setNotes(initialNotes);
  }, []);

  // OPEN
  const openNote = (index) => {
    setSelectedIndex(index);
    setEditedTitle(notes[index].title);
    setEditedContent(notes[index].content);
  };

  // CLOSE
  const closeNote = () => {
    setSelectedIndex(null);
  };

  // SAVE
  const saveNote = () => {
    const updated = [...notes];
    updated[selectedIndex] = {
      title: editedTitle,
      content: editedContent,
    };

    setNotes(updated);
    localStorage.setItem("notes", JSON.stringify(updated));
    closeNote();
  };

  const deleteNote = () => {
  const updated = notes.filter((_, i) => i !== selectedIndex);

  setNotes(updated);
  localStorage.setItem("notes", JSON.stringify(updated));
  closeNote();
};

  /* ================= DRAG SUPPORT ================= */

  // mouse
  const handleMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - modalRef.current.offsetLeft,
      y: e.clientY - modalRef.current.offsetTop,
    };
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const handleMouseUp = () => {
    dragging.current = false;
  };

  // touch (mobile)
  const handleTouchStart = (e) => {
    dragging.current = true;
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - modalRef.current.offsetLeft,
      y: touch.clientY - modalRef.current.offsetTop,
    };
  };

  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const touch = e.touches[0];
    modalRef.current.style.left = `${touch.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${touch.clientY - offset.current.y}px`;
  };

  const handleTouchEnd = () => {
    dragging.current = false;
  };

  return (
    <div className="notes-page">
      {/* GRID */}
      <div className="notes-grid">
        {notes.map((note, i) => (
          <div key={i} className="note-card" onClick={() => openNote(i)}>
            <h4>{note.title}</h4>
            <p>Click to view / edit</p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedIndex !== null && (
        <div className="modal-overlay" onClick={closeNote}>
          <div
            ref={modalRef}
            className="modal draggable"
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* DRAG HEADER */}
            <div
              className="drag-header"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              Drag
            </div>

            {/* TITLE */}
            <input
              className="note-title-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />

            {/* CONTENT */}
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="note-textarea"
            />

            {/* ACTIONS */}
<div className="modal-actions">
  <button className="cancel" onClick={closeNote}>
    Cancel
  </button>

  <button className="delete" onClick={deleteNote}>
    Delete
  </button>

  <button className="save" onClick={saveNote}>
    Save
  </button>
</div>
          </div>
        </div>
      )}
    </div>
  );
}
