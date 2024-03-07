const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config(); // Load environment variables from .env file


// Configure PostgreSQL connection using environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Path to the SQL seed file
const sqlFilePath = "./prisma/sql/seed.sql"; 

async function seedDatabase() {
  try {
    // Read the SQL file
    const sql = fs.readFileSync(sqlFilePath, "utf8");

    // Connect to the database
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query("BEGIN");

      // Execute SQL commands from the file
      await client.query(sql);

      // Commit transaction
      await client.query("COMMIT");

      console.log("Seed data inserted successfully");
    } catch (err) {
      // Rollback transaction on error
      await client.query("ROLLBACK");
      console.error("Error seeding data:", err);
    } finally {
      // Release client back to the pool
      client.release();
      // Close the pool
      await pool.end();
    }
  } catch (err) {
    console.error("Error reading SQL file:", err);
  }
}

seedDatabase();
