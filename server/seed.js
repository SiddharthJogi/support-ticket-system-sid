/* server/seed.js */
const pool = require('./db');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
    try {
        console.log("🌱 Seeding Database...");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("12345", salt);

        await pool.query("TRUNCATE TABLE tickets, employees, users RESTART IDENTITY CASCADE");

        // 1. Manager (IT Head)
        const managerRes = await pool.query(
            `INSERT INTO employees (full_name, email, password_hash, role, experience_level) 
             VALUES ($1, $2, $3, $4, $5) RETURNING employee_id`,
            ['Siddharth Manager', 'admin@sudlife.in', hashedPassword, 'manager', 5]
        );
        const managerId = managerRes.rows[0].employee_id;

        // 2. Support Staff (Expanded Team)
        const employees = [
            ['Rahul Support', 'rahul@sudlife.in', 'support', 1],
            ['Anjali Senior', 'anjali@sudlife.in', 'support', 3],
            ['Vikram Tech', 'vikram@sudlife.in', 'support', 4],
            ['Siddharth Lead', 'siddharth@sudlife.in', 'support', 5],
        ];

        for (let emp of employees) {
            await pool.query(
                `INSERT INTO employees (full_name, email, password_hash, role, experience_level, manager_id) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [emp[0], emp[1], hashedPassword, emp[2], emp[3], managerId]
            );
        }

        // 3. Customer
        await pool.query(
            `INSERT INTO users (full_name, email, password_hash, policy_number) 
             VALUES ($1, $2, $3, $4)`,
            ['Amit Policyholder', 'amit@gmail.com', hashedPassword, 'SUD-99887766']
        );

        console.log("✅ Database Populated Successfully!");
        console.log("👉 Manager: admin@sudlife.in");
        console.log("👉 Team: rahul@sudlife.in, anjali@sudlife.in, vikram@sudlife.in");
        console.log("👉 User: amit@gmail.com");
        console.log("🔑 Password for all: 12345");
        process.exit();

    } catch (err) {
        console.error("❌ Seeding Failed:", err.message);
        process.exit(1);
    }
};

seedDatabase();