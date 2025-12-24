import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState("");

  async function loadStudents() {
    try {
      setErr("");
      setLoading(true);
      const res = await fetch(`${API}/students`);
      if (!res.ok) throw new Error(`GET /students failed (${res.status})`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load students");
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ name, grade }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create student");
      setName("");
      setGrade("");
      await loadStudents();
    } catch (e) {
      setErr(e.message || "Create failed");
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setEditName(s.name ?? "");
    setEditGrade(s.grade ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditGrade("");
  }

  async function saveEdit(id) {
    try {
      setErr("");
      const res = await fetch(`${API}/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, grade: editGrade }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update student");
      cancelEdit();
      await loadStudents();
    } catch (e) {
      setErr(e.message || "Update failed");
    }
  }

  async function deleteStudent(id) {
    if (!confirm("Delete this student? This will also delete their notes.")) return;
    try {
      setErr("");
      const res = await fetch(`${API}/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to delete student");
      await loadStudents();
    } catch (e) {
      setErr(e.message || "Delete failed");
    }
  }

  return (
    <div className="page">
      <header className="header">
        <h1>Anecdotal Notes App</h1>
        <p>Vite + React frontend → Express API → PostgreSQL</p>
      </header>

      {err && <div className="error">{err}</div>}

      <section className="card">
        <h2>Add Student</h2>
        <form onSubmit={createStudent} className="form">
          <input
            placeholder="Student name (e.g., Alex Rivera)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Grade (e.g., 10)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
          />
          <button type="submit">Add</button>
        </form>
      </section>

      <section className="card">
        <h2>Students</h2>

        {loading ? (
          <p>Loading…</p>
        ) : students.length === 0 ? (
          <p>No students yet. Add one above.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th style={{ width: 240 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    {editingId === s.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td>
                    {editingId === s.id ? (
                      <input value={editGrade} onChange={(e) => setEditGrade(e.target.value)} />
                    ) : (
                      s.grade
                    )}
                  </td>
                  <td className="actions">
                    {editingId === s.id ? (
                      <>
                        <button onClick={() => saveEdit(s.id)}>Save</button>
                        <button className="secondary" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(s)}>Edit</button>
                        <button className="danger" onClick={() => deleteStudent(s.id)}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="hint">
          Backend URL: <code>{API}</code>
        </div>
      </section>
    </div>
  );
}
