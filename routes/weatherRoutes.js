const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Get daily summaries
router.get('/daily-summary', (req, res) => {
  db.all(`SELECT * FROM daily_summary`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get alerts
router.get('/alerts', (req, res) => {
  db.all(`SELECT * FROM alerts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/getdata',(req,res)=>{
  db.all(`SELECT * FROM daily_summary`, [], (err, rows) => {
    console.log("DATA",rows)
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
})
module.exports = router;
