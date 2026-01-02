/* server/routes/tickets.js */
const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");

// --- SECURITY MIDDLEWARE ---
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied" });
    }
    next();
  };
};

// 1. CREATE TICKET (User Only)
router.post("/", authorize, checkRole(['user']), async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    const newTicket = await pool.query(
      "INSERT INTO tickets (user_id, title, description, category, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, title, description, category, priority]
    );
    res.json(newTicket.rows[0]);
  } catch (err) { res.status(500).send("Server Error"); }
});

// 2. GET ALL TICKETS (Manager Only)
router.get("/all", authorize, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const allTickets = await pool.query(
      `SELECT t.*, u.full_name as created_by, e.full_name as assigned_employee
       FROM tickets t 
       JOIN users u ON t.user_id = u.user_id 
       LEFT JOIN employees e ON t.assigned_to = e.employee_id
       ORDER BY t.created_at DESC`
    );
    res.json(allTickets.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

// 3. GET MY ASSIGNED TICKETS (Support Staff Only) <--- RESTORED
router.get("/assigned", authorize, checkRole(['support', 'manager']), async (req, res) => {
    try {
      const myWork = await pool.query(
        `SELECT t.*, u.full_name as created_by
         FROM tickets t 
         JOIN users u ON t.user_id = u.user_id 
         WHERE t.assigned_to = $1 AND t.status != 'resolved'
         ORDER BY CASE WHEN t.priority = 'urgent' THEN 1 ELSE 2 END, t.created_at ASC`,
        [req.user.id]
      );
      res.json(myWork.rows);
    } catch (err) { 
        console.error(err);
        res.status(500).send("Server Error"); 
    }
});

// 4. GET MY TICKETS (User)
router.get("/my-tickets", authorize, async (req, res) => {
  try {
    const myTickets = await pool.query(
      "SELECT * FROM tickets WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(myTickets.rows);
  } catch (err) { res.status(500).send("Server Error"); }
});

// 5. ASSIGN TICKET (Manager) <--- RESTORED
router.put("/assign/:id", authorize, checkRole(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;
    await pool.query("UPDATE tickets SET assigned_to = $1, status = 'in_progress' WHERE ticket_id = $2", [employee_id, id]);
    res.json({ message: "Assigned Successfully" });
  } catch (err) { res.status(500).send("Server Error"); }
});

// 6. RESOLVE TICKET (Support Staff) <--- RESTORED
router.put("/resolve/:id", authorize, checkRole(['support', 'manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { resolution_notes } = req.body;
      await pool.query(
          "UPDATE tickets SET status = 'resolved', resolution_notes = $1 WHERE ticket_id = $2", 
          [resolution_notes, id]
      );
      res.json({ message: "Ticket Resolved" });
    } catch (err) { res.status(500).send("Server Error"); }
  });

// 7. ANALYTICS (Manager) <--- RESTORED
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
    } catch (err) { res.status(500).send("Server Error"); }
});

module.exports = router;