import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open existing database
const db = new Database(join(__dirname, "../../veribridge.db"));

// Read and execute auth tokens migration
const schema = readFileSync(
  join(__dirname, "migrations/003_auth_tokens.sql"),
  "utf8"
);

console.log("🔐 Setting up authentication token tables...\n");

try {
  // Execute the migration
  db.exec(schema);

  console.log("\n✅ Authentication token tables created!");
  console.log("📁 Database file: veribridge.db updated");
  console.log("\nTables created:");
  console.log("  - email_verification_tokens");
  console.log("  - password_reset_tokens");
} catch (error) {
  console.error("❌ Error setting up auth token tables:", error);
  process.exit(1);
} finally {
  db.close();
}
