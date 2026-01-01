/* server/seed.js */
const pool = require('./db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
    try {
        console.log("🌱 Seeding Database...");

        // 1. Hash the password '12345'
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("12345", salt);

        // 2. Clear existing data (optional, to avoid duplicates)
        await pool.query("TRUNCATE TABLE tickets, employees, users RESTART IDENTITY CASCADE");

        // 3. Create a Manager (IT Head)
        // Login: admin@sudlife.in / 12345
        const managerRes = await pool.query(
            `INSERT INTO employees (full_name, email, password_hash, role, experience_level) 
             VALUES ($1, $2, $3, $4, $5) RETURNING employee_id`,
            ['Siddharth Manager', 'admin@sudlife.in', hashedPassword, 'manager', 5]
        );
        const managerId = managerRes.rows[0].employee_id;

        // 4. Create a Support Agent (Reports to Manager)
        // Login: rahul@sudlife.in / 12345
        await pool.query(
            `INSERT INTO employees (full_name, email, password_hash, role, experience_level, manager_id) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ['Rahul Support', 'rahul@sudlife.in', hashedPassword, 'support', 1, managerId]
        );

        // 5. Create a Policyholder (User)
        // Login: amit@gmail.com / 12345
        await pool.query(
            `INSERT INTO users (full_name, email, password_hash, policy_number) 
             VALUES ($1, $2, $3, $4)`,
            ['Amit Policyholder', 'amit@gmail.com', hashedPassword, 'SUD-99887766']
        );

        console.log("✅ Database Populated Successfully!");
        console.log("👉 Manager Login: admin@sudlife.in | Pass: 12345");
        console.log("👉 User Login:    amit@gmail.com   | Pass: 12345");
        process.exit();

    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seedDatabase();