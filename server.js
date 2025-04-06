const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// bodyParser
app.use(bodyParser.json());

app.use(express.json()); // This enables parsing of JSON POST requests

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true }
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.stack);
  } else {
    console.log('✅ MySQL connected');
  }
});

// Save location
app.post('/api/locations', (req, res) => {
  console.log("📥 Incoming POST /api/locations:", req.body); // ← ADD THIS

  const { user_id, location_name, latitude, longitude } = req.body;

  if (!user_id || !location_name || latitude === undefined || longitude === undefined) {
    console.log("❌ Missing data in request:", req.body);
    return res.status(400).json({ error: 'Missing required data' });
  }

  const sql = 'INSERT INTO saved_locations (user_id, location_name, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, location_name, latitude, longitude], (err, result) => {
    if (err) {
      console.error("❌ DB insert failed:", err); // ← MAKE SURE THIS STAYS
      return res.status(500).json({ error: 'DB insert failed', details: err });
    }

    console.log("✅ Bookmark saved with ID:", result.insertId);
    res.status(201).json({ id: result.insertId });
  });
});



// Get locations by user
app.get('/api/locations/:user_id', (req, res) => {
  const sql = 'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


// For all GET requests, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
