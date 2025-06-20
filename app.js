const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'manu@2005', // Change this
    database: 'db'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Sign Up
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                res.send('Error: Email already exists or database error');
            } else {
                res.send('Sign up successful! User registered.');
            }
        });
    } catch (error) {
        res.send('Error occurred during sign up');
    }
});

// Sign In
app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            res.send('Database error');
        } else if (results.length === 0) {
            res.send('User not found');
        } else {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (passwordMatch) {
                res.send(`Welcome ${user.name}! Sign in successful.`);
            } else {
                res.send('Wrong password');
            }
        }
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});