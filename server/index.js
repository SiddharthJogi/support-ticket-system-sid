const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db'); // Import the database connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Test Route to check Server health
app.get('/', (req, res) => {
    res.json({ message: "SUD Life Support System API is Running 🚀" });
});

// 2. Test Route to check Database connection
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