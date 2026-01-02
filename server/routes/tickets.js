/* server/routes/tickets.js */
const router = require("express").Router();
const pool = require("../db");
const authorize = require("../middleware/authorization");
const nodemailer = require("nodemailer");
require("dotenv").config(); 

// --- SECURITY MIDDLEWARE ---
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied" });
    }
    next();
  };
};

// 1. CREATE TICKET (User)
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

// 2. GET ALL TICKETS (Manager)
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

// 3. GET ASSIGNED TICKETS (Support)
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
    } catch (err) { res.status(500).send("Server Error"); }
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

// 5. ASSIGN TICKET (Manager)
router.put("/assign/:id", authorize, checkRole(['manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id } = req.body;
    await pool.query("UPDATE tickets SET assigned_to = $1, status = 'in_progress' WHERE ticket_id = $2", [employee_id, id]);
    res.json({ message: "Assigned Successfully" });
  } catch (err) { res.status(500).send("Server Error"); }
});

// 6. RESOLVE TICKET (Support Staff) -- DEBUG MODE --
router.put("/resolve/:id", authorize, checkRole(['support', 'manager']), async (req, res) => {
    try {
      const { id } = req.params;
      const { resolution_notes } = req.body;

      // DEBUG: Check Env Variables
      const EMAIL_USER = process.env.EMAIL_USER;
      const EMAIL_PASS = process.env.EMAIL_PASS;
      
      console.log("------------------------------------------------");
      console.log(`📧 Attempting to resolve Ticket #${id}`);
      console.log(`🔐 Sender: ${EMAIL_USER}`);
      console.log(`🔑 Password Loaded: ${EMAIL_PASS ? "YES (Hidden)" : "NO (Check .env)"}`);

      if (!EMAIL_USER || !EMAIL_PASS) {
          console.error("❌ CRITICAL: Email credentials missing in .env");
          // Proceed to close ticket but warn
      }

      // Configure Transporter
      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', 
          port: 465,
          secure: true, 
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
          connectionTimeout: 10000 
      });

      // Update DB
      const ticketRes = await pool.query(
          "UPDATE tickets SET status = 'resolved', resolution_notes = $1 WHERE ticket_id = $2 RETURNING *", 
          [resolution_notes, id]
      );

      if (ticketRes.rows.length === 0) return res.status(404).json({error: "Ticket not found"});
      
      // Get Recipient
      const userRes = await pool.query("SELECT full_name, email FROM users WHERE user_id = $1", [ticketRes.rows[0].user_id]);
      const user = userRes.rows[0];

      console.log(`📨 Recipient Found: ${user.email} (${user.full_name})`);

      // Prepare Email
      const mailOptions = {
        from: `"SUD Life Support" <${EMAIL_USER}>`, 
        to: user.email,
        subject: `Ticket #${id} Resolved - SUD Life Insurance`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #003366; padding: 20px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">SUD Life Support</h1>
            </div>
            <div style="padding: 20px;">
              <p>Dear <strong>${user.full_name}</strong>,</p>
              <p>Your support ticket <strong>#${id}</strong> has been resolved.</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
                <strong style="color: #28a745;">Resolution:</strong><br/>
                <p>${resolution_notes}</p>
              </div>
              <p>Please login to your dashboard to view details.</p>
            </div>
          </div>
        `
      };

      // Send & Log
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ SUCCESS: Email sent to ${user.email}`);
      } catch (emailErr) {
        console.error("❌ EMAIL FAILED:", emailErr);
      }
      console.log("------------------------------------------------");

      res.json({ message: "Ticket Resolved" });

    } catch (err) { 
        console.error(err);
        res.status(500).send("Server Error"); 
    }
});

// 7. ANALYTICS (Manager)
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