/* server/routes/tickets.js */
const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization"); // Checks if logged in
const checkRole = require("../middleware/roles");         // Checks role (Manager vs User)
const { validateTicket } = require("../middleware/validations"); // Checks data quality

// 1. CREATE TICKET (Users Only)
router.post("/", 
    authorize, 
    checkRole(['user']), 
    validateTicket, // <--- Automatic Validation happens here
    async (req, res) => {
        try {
            const { title, description, category, priority } = req.body;
            
            const newTicket = await pool.query(
                "INSERT INTO tickets (user_id, title, description, category, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [req.user.id, title, description, category, priority]
            );

            res.json(newTicket.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

// 2. GET ALL TICKETS (Managers Only)
router.get("/all", 
    authorize, 
    checkRole(['manager', 'admin']), // <--- Security: Users cannot hit this URL
    async (req, res) => {
        try {
            const allTickets = await pool.query(
                `SELECT t.*, u.full_name as created_by 
                 FROM tickets t 
                 JOIN users u ON t.user_id = u.user_id 
                 ORDER BY 
                    CASE WHEN t.status = 'open' THEN 1 ELSE 2 END, -- Show Open tickets first
                    t.created_at DESC`
            );
            res.json(allTickets.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

// 3. GET MY TICKETS (Users Only)
router.get("/my-tickets", authorize, async (req, res) => {
    try {
        const myTickets = await pool.query(
            "SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(myTickets.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. ASSIGN TICKET (Managers Only)
router.put("/assign/:id", 
    authorize, 
    checkRole(['manager']), 
    async (req, res) => {
        try {
            const { id } = req.params;
            const { employee_id } = req.body; // Sent from frontend

            // Verify ticket exists
            const ticket = await pool.query("SELECT * FROM tickets WHERE ticket_id = $1", [id]);
            if (ticket.rows.length === 0) return res.status(404).json({ error: "Ticket not found" });

            // Assign and update status to 'in_progress'
            const update = await pool.query(
                "UPDATE tickets SET assigned_to = $1, status = 'in_progress' WHERE ticket_id = $2 RETURNING *",
                [employee_id, id]
            );

            res.json({ message: "Ticket Assigned", ticket: update.rows[0] });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    }
);

// 5. RESOLVE TICKET (Employees/Managers)
router.put("/resolve/:id", authorize, checkRole(['manager', 'support']), async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution_notes } = req.body;

        const update = await pool.query(
            "UPDATE tickets SET status = 'resolved', resolution_notes = $1 WHERE ticket_id = $2 RETURNING *",
            [resolution_notes, id]
        );

        res.json({ message: "Ticket Resolved", ticket: update.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;