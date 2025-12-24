import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [err, setErr] = useState("");

  // student create
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  // note create
  const [newNote, setNewNote] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [notifyEmailsText, setNotifyEmailsText] = useState("");

  // note edit
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");

  async function loadStudents() {
    try {
      setErr("");
      setLoadingStudents(true);
      const res = await fetch(`${API}/students`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load students");
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  }

  async function loadNotes(studentId) {
    try {
      setErr("");
      setLoadingNotes(true);
      const res = await fetch(`${API}/students/${studentId}/notes`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load notes");
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load notes");
    } finally {
      setLoadingNotes(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function createStudent(e) {
    e.preventDefault();
    try {
      setErr("");
      const res = await fetch(`${API}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade: grade.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create student");
      setName("");
      setGrade("");
      await loadStudents();
    } catch (e) {
      setErr(e.message || "Create student failed");
    }
  }

  function selectStudent(s) {
    setSelectedStudent(s);
    setEditingNoteId(null);
    setEditNoteText("");
    setNewNote("");
    loadNotes(s.id);
  }

  function parseNotifyEmails(text) {
    // comma-separated list -> array
    return text
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  async function createNote(e) {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setErr("");
      const notify_emails = parseNotifyEmails(notifyEmailsText);

      const res = await fetch(`${API}/students/${selectedStudent.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: newNote.trim(),
          teacher_name: teacherName.trim(),
          notify_emails,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create note");

      setNewNote("");
      await loadNotes(selectedStudent.id);
    } catch (e) {
      setErr(e.message || "Create note failed");
    }
  }

  function startEditNote(n) {
    setEditingNoteId(n.id);
    setEditNoteText(n.note);
  }

  function cancelEditNote() {
    setEditingNoteId(null);
    setEditNoteText("");
  }

  async function saveEditNote(noteId) {
    if (!selectedStudent) return;

    try {
      setErr("");
      const res = await fetch(
        `${API}/students/${selectedStudent.id}/notes/${noteId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note: editNoteText.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update note");
      cancelEditNote();
      await loadNotes(selectedStudent.id);
    } catch (e) {
      setErr(e.message || "Update note failed");
    }
  }

  async function deleteNote(noteId) {
    if (!selectedStudent) return;
    if (!confirm("Delete this note?")) return;

    try {
      setErr("");
      const res = await fetch(
        `${API}/students/${selectedStudent.id}/notes/${noteId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete note");
      await loadNotes(selectedStudent.id);
    } catch (e) {
      setErr(e.message || "Delete note failed");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Anecdotal Notes App</h1>
        <p>Teacher attribution + notify list (stored)</p>
      </header>

      {err && <div className="error">{err}</div>}

      <div className="grid">
        {/* LEFT */}
        <section className="card">
          <h2>Students</h2>

          <form onSubmit={createStudent} className="form">
            <input
              placeholder="Student name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>

          {loadingStudents ? (
            <p>Loading…</p>
          ) : students.length === 0 ? (
            <p>No students yet.</p>
          ) : (
            <ul className="list">
              {students.map((s) => (
                <li
                  key={s.id}
                  className={
                    selectedStudent?.id === s.id ? "listItem active" : "listItem"
                  }
                  onClick={() => selectStudent(s)}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <div className="name">{s.name}</div>
                    <div className="meta">Grade: {s.grade}</div>
                  </div>
                  <div className="meta">ID: {s.id}</div>
                </li>
              ))}
            </ul>
          )}

          <div className="hint">
            API: <code>{API}</code>
          </div>
        </section>

        {/* RIGHT */}
        <section className="card">
          <h2>Anecdotal Notes</h2>

          {!selectedStudent ? (
            <p>Select a student to view/add notes.</p>
          ) : (
            <>
              <div className="selected">
                Selected: <strong>{selectedStudent.name}</strong> (Grade{" "}
                {selectedStudent.grade})
              </div>

              <form onSubmit={createNote} className="noteForm">
                <input
                  placeholder="Teacher name (e.g., Ms. Lopez)"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
                <input
                  placeholder="Notify emails (comma-separated)"
                  value={notifyEmailsText}
                  onChange={(e) => setNotifyEmailsText(e.target.value)}
                />
                <textarea
                  placeholder="Write an anecdotal note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  required
                />
                <button type="submit">Add Note</button>
              </form>

              {loadingNotes ? (
                <p>Loading notes…</p>
              ) : notes.length === 0 ? (
                <p>No notes yet.</p>
              ) : (
                <ul className="notes">
                  {notes.map((n) => (
                    <li key={n.id} className="noteItem">
                      <div className="meta">
                        Note ID: {n.id} •{" "}
                        {n.created_at
                          ? new Date(n.created_at).toLocaleString()
                          : ""}
                      </div>

                      <div className="noteText">{n.note}</div>

                      <div className="meta">
                        Teacher: <strong>{n.teacher_name || "Unknown"}</strong>
                      </div>

                      <div className="meta">
                        Notify:{" "}
                        {Array.isArray(n.notify_emails) && n.notify_emails.length
                          ? n.notify_emails.join(", ")
                          : "None"}
                      </div>

                      {editingNoteId === n.id ? (
                        <>
                          <textarea
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            rows={3}
                          />
                          <div className="actions">
                            <button onClick={() => saveEditNote(n.id)}>
                              Save
                            </button>
                            <button
                              className="secondary"
                              onClick={cancelEditNote}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="actions">
                          <button onClick={() => startEditNote(n)}>Edit</button>
                          <button
                            className="danger"
                            onClick={() => deleteNote(n.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
