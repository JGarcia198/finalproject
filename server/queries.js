const pool = require("./db");

// GET all students
const getStudents = async (req, res) => {
  try {
    const results = await pool.query(
      "SELECT * FROM students ORDER BY id ASC"
    );
    res.json(results.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// POST create student
const createStudent = async (req, res) => {
  const { name, grade } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  try {
    const results = await pool.query(
      "INSERT INTO students (name, grade) VALUES ($1, $2) RETURNING *",
      [name, grade || null]
    );
    res.status(201).json(results.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// PUT update student
const updateStudent = async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, grade } = req.body;

  try {
    const results = await pool.query(
      "UPDATE students SET name = $1, grade = $2 WHERE id = $3 RETURNING *",
      [name, grade || null, id]
    );
    if (results.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json(results.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update student" });
  }
};

// DELETE student
const deleteStudent = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const results = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING *",
      [id]
    );
    if (results.rowCount === 0) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted", student: results.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
