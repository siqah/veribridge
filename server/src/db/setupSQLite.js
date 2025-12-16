import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create/open SQLite database
const db = new Database(join(__dirname, "../../veribridge.db"), {
  verbose: console.log,
});

// Read and execute schema
const schema = readFileSync(join(__dirname, "schema.sqlite.sql"), "utf8");

// Split by semicolons and execute each statement
const statements = schema.split(";").filter((s) => s.trim());

console.log("🗃️  Setting up SQLite database...\n");

try {
  statements.forEach((statement, index) => {
    if (statement.trim()) {
      db.exec(statement);
      console.log(`✅ Statement ${index + 1} executed successfully`);
    }
  });

  console.log("\n✅ SQLite database setup complete!");
  console.log(`📁 Database file: ${join(__dirname, "../../veribridge.db")}`);
} catch (error) {
  console.error("❌ Error setting up database:", error);
  process.exit(1);
} finally {
  db.close();
}
