const pool = require("./db");

// -------------------- STUDENTS --------------------

// GET /students
const getStudents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, grade, created_at FROM students ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ error: "Failed to get students" });
  }
};

// POST /students
const createStudent = async (req, res) => {
  try {
    const { name, grade } = req.body;

    if (!name || !grade) {
      return res.status(400).json({ error: "name and grade are required" });
    }

    const result = await pool.query(
      "INSERT INTO students (name, grade) VALUES ($1, $2) RETURNING id, name, grade, created_at",
      [name, grade]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createStudent error:", err);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// PUT /students/:id
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade } = req.body;

    if (!name || !grade) {
      return res.status(400).json({ error: "name and grade are required" });
    }

    const result = await pool.query(
      "UPDATE students SET name = $1, grade = $2 WHERE id = $3 RETURNING id, name, grade, created_at",
      [name, grade, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// DELETE /students/:id
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM students WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

// -------------------- NOTES (per student) --------------------

// GET /students/:id/notes
const getNotesByStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT id, student_id, note, created_at FROM notes WHERE student_id = $1 ORDER BY id ASC",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getNotesByStudent error:", err);
    res.status(500).json({ error: "Failed to get notes" });
  }
};

// POST /students/:id/notes
const createNote = async (req, res) => {
  try {
    const { id } = req.params; // student id
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "note is required" });
    }

    const result = await pool.query(
      "INSERT INTO notes (student_id, note) VALUES ($1, $2) RETURNING id, student_id, note, created_at",
      [id, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createNote error:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
};

// PUT /students/:studentId/notes/:noteId
const updateNote = async (req, res) => {
  try {
    const { studentId, noteId } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "note is required" });
    }

    const result = await pool.query(
      `UPDATE notes
       SET note = $1
       WHERE id = $2 AND student_id = $3
       RETURNING id, student_id, note, created_at`,
      [note, noteId, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found for this student" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateNote error:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
};

// DELETE /students/:studentId/notes/:noteId
const deleteNote = async (req, res) => {
  try {
    const { studentId, noteId } = req.params;

    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND student_id = $2",
      [noteId, studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Note not found for this student" });
    }

    res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("deleteNote error:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
};

module.exports = {
  // students
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,

  // notes
  getNotesByStudent,
  createNote,
  updateNote,
  deleteNote,
};
