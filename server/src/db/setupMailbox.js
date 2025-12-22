import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Open existing database
const db = new Database(join(__dirname, "../../veribridge.db"));

// Read and execute mailbox schema
const schema = readFileSync(join(__dirname, "schema.mailbox.sql"), "utf8");

// Split by semicolons and execute each statement
const statements = schema.split(";").filter((s) => s.trim());

console.log("📮 Setting up Digital Mailbox tables...\n");

try {
  statements.forEach((statement, index) => {
    if (statement.trim()) {
      db.exec(statement);
      console.log(`✅ Statement ${index + 1} executed successfully`);
    }
  });

  console.log("\n✅ Digital Mailbox tables created!");
  console.log("📁 Database file: veribridge.db updated");
} catch (error) {
  console.error("❌ Error setting up mailbox tables:", error);
  process.exit(1);
} finally {
  db.close();
}
