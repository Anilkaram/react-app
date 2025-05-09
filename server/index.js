const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET_KEY = 'mysecretkey';

app.use(cors());
app.use(bodyParser.json());
/*all*/
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin@123',
  database: 'userauth',
  multipleStatements: true
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');

  // Auto-create DB and Table if not exists
  const initSQL = `
    CREATE DATABASE IF NOT EXISTS userauth;
    USE userauth;
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );
  `;
  db.query(initSQL, err => {
    if (err) throw err;
    console.log('Database and users table ensured.');
  });
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, hashedPassword], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User registered successfully!' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('User not found');
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send('Incorrect password');
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
    res.send({ message: 'Login successful', token });
  });
});

app.get('/profile', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token required');
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const sql = 'SELECT id, username, email FROM users WHERE id = ?';
    db.query(sql, [decoded.id], (err, results) => {
      if (err || results.length === 0) return res.status(404).send('User not found');
      res.send(results[0]);
    });
  } catch (e) {
    res.status(401).send('Invalid token');
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
