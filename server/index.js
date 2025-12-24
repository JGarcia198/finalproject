const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./queries");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* STUDENTS CRUD */
app.get("/students", db.getStudents);
app.post("/students", db.createStudent);
app.put("/students/:id", db.updateStudent);
app.delete("/students/:id", db.deleteStudent);

/* NOTES per student */
app.get("/students/:id/notes", db.getNotesByStudent);
app.post("/students/:id/notes", db.createNote);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
