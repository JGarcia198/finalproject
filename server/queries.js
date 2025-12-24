const pool = require("./db");

/**
 * STUDENTS
 */
const getStudents = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, grade, created_at FROM students ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, grade } = req.body;

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "name is required" });
    }
    if (!grade || String(grade).trim() === "") {
      return res.status(400).json({ error: "grade is required" });
    }

    const result = await pool.query(
      "INSERT INTO students (name, grade) VALUES ($1, $2) RETURNING id, name, grade, created_at",
      [name.trim(), String(grade).trim()]
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

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "name is required" });
    }
    if (!grade || String(grade).trim() === "") {
      return res.status(400).json({ error: "grade is required" });
    }

    const result = await pool.query(
      "UPDATE students SET name=$1, grade=$2 WHERE id=$3 RETURNING id, name, grade, created_at",
      [name.trim(), String(grade).trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "student not found" });
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

    const result = await pool.query(
      "DELETE FROM students WHERE id=$1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "student not found" });
    }

    res.json({ deleted: true, id: Number(id) });
  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

/**
 * NOTES (per student)
 * Table schema you showed:
 * notes(id, student_id, note, created_at)
 */
const getNotesByStudent = async (req, res) => {
  try {
    const { id } = req.params; // student id

    const result = await pool.query(
      "SELECT id, student_id, note, created_at FROM notes WHERE student_id=$1 ORDER BY id ASC",
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("getNotesByStudent error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

const createNote = async (req, res) => {
  try {
    const { id } = req.params; // student id
    const { note } = req.body;

    if (!note || String(note).trim() === "") {
      return res.status(400).json({ error: "note is required" });
    }

    // optional: verify student exists (nice error message)
    const studentCheck = await pool.query(
      "SELECT id FROM students WHERE id=$1",
      [id]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: "student not found" });
    }

    const result = await pool.query(
      "INSERT INTO notes (student_id, note) VALUES ($1, $2) RETURNING id, student_id, note, created_at",
      [id, note.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createNote error:", err);
    res.status(500).json({ error: "Failed to create note" });
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
};
