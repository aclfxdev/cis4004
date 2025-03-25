const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load from .env
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'cis4004-server.mysql.database.azure.com',
  user: 'borptpseaw@cis4004-server',
  password: process.env.DB_PASSWORD,  // set this in Azure
  database: 'weatherdb',
  ssl: {
    rejectUnauthorized: true
  }
});

db.connect(err => {
  if (err) {
    console.error("MySQL Connection Failed:", err.stack);
    process.exit(1);
  }
  console.log("Connected to Azure MySQL!");
});

// API: Save location
app.post('/api/locations', (req, res) => {
  const { user_id, location_name, latitude, longitude } = req.body;
  const sql = 'INSERT INTO saved_locations (user_id, location_name, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, location_name, latitude, longitude], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId });
  });
});

// API: Get user locations
app.get('/api/locations/:user_id', (req, res) => {
  const sql = 'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC';
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
