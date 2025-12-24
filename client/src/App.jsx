import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [error, setError] = useState("");

  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}/students`);
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  async function addStudent(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !grade.trim()) {
      setError("Please enter both name and grade.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), grade: grade.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create student.");
        return;
      }

      // add to UI instantly
      setStudents((prev) => [...prev, data]);
      setName("");
      setGrade("");
    } catch (err) {
      console.error(err);
      setError("Failed to create student.");
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>Anecdotal Notes</h1>
        <p className="subtitle">
          Create and view students (React + Express + PostgreSQL).
        </p>
      </header>

      <section className="card">
        <h2>Add Student</h2>
        <form className="form" onSubmit={addStudent}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Student name (e.g., Alex Rivera)"
          />
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Grade (e.g., 10)"
          />
          <button type="submit">Add</button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>

      <section className="card">
        <div className="row">
          <h2>Students</h2>
          <button className="secondary" onClick={fetchStudents}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : students.length === 0 ? (
          <p>No students yet.</p>
        ) : (
          <ul className="list">
            {students.map((s) => (
              <li key={s.id} className="listItem">
                <div>
                  <div className="name">{s.name}</div>
                  <div className="meta">Grade: {s.grade}</div>
                </div>
                <div className="meta">ID: {s.id}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
