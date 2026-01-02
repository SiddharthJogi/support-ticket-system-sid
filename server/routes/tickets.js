/* server/routes/tickets.js */
const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// --- SECURITY MIDDLEWARE ---
// This ensures only specific roles can access the route
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the 'authorize' middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied: Insufficient Permissions" });
    }
    next();
  };
};

// 1. CREATE TICKET (User Only)
// We add checkRole(['user']) so employees don't accidentally create tickets for themselves
router.post("/", authorize, checkRole(['user']), async (req, res) => {
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
});

// 2. GET ALL TICKETS (Manager & Support Only)
// SECURITY UPGRADE: Added checkRole(['manager', 'support'])
router.get("/all", authorize, checkRole(['manager', 'support']), async (req, res) => {
  try {
    const allTickets = await pool.query(
      `SELECT t.*, u.full_name as created_by, e.full_name as assigned_employee
       FROM tickets t 
       JOIN users u ON t.user_id = u.user_id 
       LEFT JOIN employees e ON t.assigned_to = e.employee_id
       ORDER BY t.created_at DESC`
    );
    res.json(allTickets.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. GET MY TICKETS (User Only)
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

// 4. ASSIGN TICKET (Manager Only)
// SECURITY UPGRADE: Added checkRole(['manager'])
router.put("/assign/:id", authorize, checkRole(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;

    await pool.query(
      "UPDATE tickets SET assigned_to = $1, status = 'in_progress' WHERE ticket_id = $2",
      [employee_id, id]
    );
    res.json({ message: "Assigned Successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 5. ANALYTICS (Manager Only)
// SECURITY UPGRADE: Added checkRole(['manager'])
router.get("/analytics", authorize, checkRole(['manager']), async (req, res) => {
    try {
        const team = await pool.query(`
            SELECT e.employee_id, e.full_name, e.role, e.experience_level, 
            COUNT(t.ticket_id) as active_tickets
            FROM employees e
            LEFT JOIN tickets t ON e.employee_id = t.assigned_to AND t.status != 'resolved'
            GROUP BY e.employee_id
        `);

        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent
            FROM tickets
        `);

        res.json({ team: team.rows, stats: stats.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;