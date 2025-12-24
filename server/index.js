const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const db = require("./queries");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// DB test
app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS now");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// STUDENTS CRUD
app.get("/students", db.getStudents);
app.post("/students", db.createStudent);
app.put("/students/:id", db.updateStudent);
app.delete("/students/:id", db.deleteStudent);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
