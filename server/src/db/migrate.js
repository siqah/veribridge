import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "veribridge",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("🔄 Starting database migrations...\n");

    // Read migration files
    const migrations = ["001_freelancer_os.sql"];

    for (const migrationFile of migrations) {
      const migrationPath = join(__dirname, "migrations", migrationFile);

      try {
        console.log(`📄 Running migration: ${migrationFile}`);
        const sql = readFileSync(migrationPath, "utf8");

        await client.query(sql);

        console.log(`✅ Successfully applied: ${migrationFile}\n`);
      } catch (error) {
        console.error(`❌ Error applying ${migrationFile}:`, error.message);
        throw error;
      }
    }

    console.log("✨ All migrations completed successfully!");

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('company_orders', 'invoices', 'invoice_items', 'mailbox_items', 'api_keys')
      ORDER BY table_name
    `);

    console.log("\n📊 New tables created:");
    result.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
runMigrations();
