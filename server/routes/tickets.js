/* server/routes/tickets.js */
const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// 1. CREATE A TICKET (User Only)
router.post("/", authorize, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    
    // req.user.id comes from the middleware!
    const newTicket = await pool.query(
      "INSERT INTO tickets (user_id, title, description, category, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description, category, priority]
    );

    res.json(newTicket.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. GET ALL TICKETS (Manager View)
router.get("/all", authorize, async (req, res) => {
  try {
    // Join with Users table to get the name of who asked for help
    const allTickets = await pool.query(
      `SELECT t.*, u.full_name as created_by 
       FROM tickets t 
       JOIN users u ON t.user_id = u.user_id 
       ORDER BY t.created_at DESC`
    );
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;