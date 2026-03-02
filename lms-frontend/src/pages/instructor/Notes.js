import { useEffect, useRef, useState } from "react";
import "../../styles/student/notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  const modalRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  /* ================= LOAD NOTES FROM BACKEND ================= */

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  /* ================= CREATE NEW NOTE ================= */

  const createNote = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: "New Note",
          content: "",
        }),
      });

      const newNote = await res.json();
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  /* ================= OPEN / CLOSE ================= */

  const openNote = (index) => {
    setSelectedIndex(index);
    setEditedTitle(notes[index].title);
    setEditedContent(notes[index].content);
  };

  const closeNote = () => {
    setSelectedIndex(null);
  };

  /* ================= SAVE NOTE ================= */

  const saveNote = async () => {
    try {
      const noteId = notes[selectedIndex]._id;

      const res = await fetch(
        `http://localhost:5000/api/notes/${noteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: editedTitle,
            content: editedContent,
          }),
        }
      );

      const updatedNote = await res.json();

      const updated = [...notes];
      updated[selectedIndex] = updatedNote;

      setNotes(updated);
      closeNote();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  /* ================= DELETE NOTE ================= */

  const deleteNote = async () => {
    try {
      const noteId = notes[selectedIndex]._id;

      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const updated = notes.filter((_, i) => i !== selectedIndex);
      setNotes(updated);
      closeNote();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  /* ================= DRAG SUPPORT ================= */

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

  /* ================= UI ================= */

  return (
    <div className="notes-page">
      {/* CREATE BUTTON */}
      <div style={{ marginBottom: "15px" }}>
        <button onClick={createNote}>+ Create Note</button>
      </div>

      {/* GRID */}
      <div className="notes-grid">
        {notes.map((note, i) => (
          <div key={note._id} className="note-card" onClick={() => openNote(i)}>
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
            <div
              className="drag-header"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              Drag
            </div>

            <input
              className="note-title-input"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />

            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="note-textarea"
            />

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