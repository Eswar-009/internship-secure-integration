const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: "20kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Too many requests. Please try again later." }
});
app.use("/api/", apiLimiter);

function validId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateApplication(body) {
  const errors = [];
  if (!body || typeof body !== "object") return ["Request body is required"];

  if (!Number.isInteger(Number(body.internshipId)) || Number(body.internshipId) < 1)
    errors.push("internshipId must be a positive integer");

  if (typeof body.name !== "string" || body.name.trim().length < 2)
    errors.push("name must contain at least 2 characters");

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("A valid email is required");

  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!/^[0-9+()\-\s]{7,20}$/.test(phone))
    errors.push("A valid phone number is required");

  if (typeof body.coverLetter !== "string" || body.coverLetter.trim().length < 20)
    errors.push("coverLetter must contain at least 20 characters");

  return errors;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Secure internship API is running" });
});

app.get("/api/internships", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const domain = typeof req.query.domain === "string" ? req.query.domain.trim() : "";

  let rows;
  if (search && domain) {
    const pattern = `%${search}%`;
    rows = db.prepare(`SELECT * FROM internships
      WHERE (title LIKE ? OR company LIKE ? OR description LIKE ?)
      AND domain = ? ORDER BY id`).all(pattern, pattern, pattern, domain);
  } else if (search) {
    const pattern = `%${search}%`;
    rows = db.prepare(`SELECT * FROM internships
      WHERE title LIKE ? OR company LIKE ? OR description LIKE ?
      ORDER BY id`).all(pattern, pattern, pattern);
  } else if (domain) {
    rows = db.prepare("SELECT * FROM internships WHERE domain = ? ORDER BY id").all(domain);
  } else {
    rows = db.prepare("SELECT * FROM internships ORDER BY id").all();
  }

  res.status(200).json({ success: true, data: rows });
});

app.get("/api/internships/:id", (req, res) => {
  const id = validId(req.params.id);
  if (!id) return res.status(400).json({ success: false, error: "Invalid internship ID" });

  const row = db.prepare("SELECT * FROM internships WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ success: false, error: "Internship not found" });

  res.json({ success: true, data: row });
});

app.post("/api/applications", (req, res) => {
  const errors = validateApplication(req.body);
  if (errors.length) {
    return res.status(400).json({ success: false, error: "Validation failed", details: errors });
  }

  const internshipId = Number(req.body.internshipId);
  const internship = db.prepare("SELECT id FROM internships WHERE id = ?").get(internshipId);
  if (!internship) {
    return res.status(404).json({ success: false, error: "Internship not found" });
  }

  /* Parameterized query prevents SQL injection. */
  const result = db.prepare(`INSERT INTO applications
    (internship_id,name,email,phone,cover_letter)
    VALUES (?,?,?,?,?)`).run(
      internshipId,
      req.body.name.trim(),
      req.body.email.trim(),
      req.body.phone.trim(),
      req.body.coverLetter.trim()
    );

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
    applicationId: result.lastInsertRowid
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, error: "API route not found" });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;
