const pool = require("./db");

// -------------------- STUDENTS --------------------

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

const getNotesByStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, student_id, note, teacher_name, notify_emails, created_at
       FROM notes
       WHERE student_id = $1
       ORDER BY id ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getNotesByStudent error:", err);
    res.status(500).json({ error: "Failed to get notes" });
  }
};

const createNote = async (req, res) => {
  try {
    const { id } = req.params; // student id
    const { note, teacher_name, notify_emails } = req.body;

    if (!note) {
      return res.status(400).json({ error: "note is required" });
    }

    // teacher_name optional in request, but DB has default
    const teacher = teacher_name && String(teacher_name).trim() !== ""
      ? String(teacher_name).trim()
      : "Unknown";

    // notify_emails optional; expect array of strings
    const emails =
      Array.isArray(notify_emails)
        ? notify_emails
            .map((e) => String(e).trim())
            .filter((e) => e.length > 0)
        : [];

    const result = await pool.query(
      `INSERT INTO notes (student_id, note, teacher_name, notify_emails)
       VALUES ($1, $2, $3, $4)
       RETURNING id, student_id, note, teacher_name, notify_emails, created_at`,
      [id, note, teacher, emails]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createNote error:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
};

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
       RETURNING id, student_id, note, teacher_name, notify_emails, created_at`,
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
