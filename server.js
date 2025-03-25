const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.json());

// MySQL config (replace with your actual Azure MySQL info)
const db = mysql.createConnection({
  host: 'your-azure-mysql-host',
  user: 'your-db-user',
  password: 'your-db-password',
  database: 'your-database-name'
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected!");
});

// API: Save location
app.post('/api/locations', (req, res) => {
  const { user_id, location_name, latitude, longitude } = req.body;
  const query = 'INSERT INTO saved_locations (user_id, location_name, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(query, [user_id, location_name, latitude, longitude], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId });
  });
});

// API: Get saved locations for user
app.get('/api/locations/:user_id', (req, res) => {
  const query = 'SELECT * FROM saved_locations WHERE user_id = ? ORDER BY created_at DESC';
  db.query(query, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
