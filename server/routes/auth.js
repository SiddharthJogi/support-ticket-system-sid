/* server/routes/auth.js */
const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret Key (In production, move to .env)
const JWT_SECRET = "sud_life_super_secret_key_123";

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    // 1. Destructure input
    const { email, password, role } = req.body; 
    
    // Default to 'user' if role is not sent, but frontend sends 'employee' or 'user'
    const userRole = role || 'user'; 

    try {
        let user;
        // 2. Decide which table to check based on Role
        let tableName = userRole === 'employee' ? 'employees' : 'users';
        let idField = userRole === 'employee' ? 'employee_id' : 'user_id';

        // 3. Check if user exists
        const result = await pool.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        user = result.rows[0];

        // 4. Validate Password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid Password" });
        }

        // 5. Generate Token
        const token = jwt.sign(
            { id: user[idField], role: user.role || 'user', name: user.full_name }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 6. Send Response
        res.json({ 
            token, 
            user: { 
                id: user[idField], 
                name: user.full_name, 
                role: user.role || 'user',
                email: user.email
            } 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;