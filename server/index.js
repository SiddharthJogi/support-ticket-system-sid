/* server/index.js */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');

// IMPORT ROUTES
const authRoutes = require('./routes/auth'); // <--- NEW

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// USE ROUTES
app.use('/auth', authRoutes); // <--- NEW (This enables http://localhost:5000/auth/login)

// Health Checks
app.get('/', (req, res) => {
    res.json({ message: "SUD Life Support System API is Running 🚀" });
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Database Connected!", time: result.rows[0].now });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});