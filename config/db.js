const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./weather.db', (err) => {
  if (err) console.error('Error connecting to SQLite:', err);
  console.log('Connected to SQLite database');
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS daily_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  city TEXT NOT NULL,
  avg_temp REAL,
  max_temp REAL,
  min_temp REAL,
  dominant_condition TEXT,
  feels_like REAL,
  update_time TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT,
    condition TEXT,
    timestamp TEXT
  )`);
});

module.exports = db;
