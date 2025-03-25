const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'cis4004-server.mysql.database.azure.com',
  user: 'borptpseaw@cis4004-server',
  password: process.env.DB_PASSWORD,
  database: 'weatherdb',
  ssl: { rejectUnauthorized: true }
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.stack);
  } else {
    console.log("✅ MySQL connected");
    db.end();
  }
});
