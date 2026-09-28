const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "internships.db"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS internships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  domain TEXT NOT NULL,
  location TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  internship_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cover_letter TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (internship_id) REFERENCES internships(id)
);
`);

/* Predictable integration-test records. */
const count = db.prepare("SELECT COUNT(*) AS count FROM internships").get().count;
if (count === 0) {
  const rows = [
    ["Frontend Development Intern","NovaByte Labs","Web Development","Remote","8 weeks","Beginner","Build responsive interfaces."],
    ["AI & Machine Learning Intern","FutureMind AI","Artificial Intelligence","Hybrid","10 weeks","Intermediate","Work with practical ML projects."],
    ["Data Analytics Intern","InsightGrid","Data Science","Hybrid","8 weeks","Intermediate","Explore datasets and reports."],
    ["Cyber Security Intern","SecureStack","Cyber Security","Remote","6 weeks","Beginner","Learn application security fundamentals."]
  ];
  const insert = db.prepare(`INSERT INTO internships
    (title,company,domain,location,duration,level,description)
    VALUES (?,?,?,?,?,?,?)`);
  const tx = db.transaction(() => rows.forEach(row => insert.run(...row)));
  tx();
}

module.exports = db;
