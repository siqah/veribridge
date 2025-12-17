import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, "../../veribridge.db"));

try {
  console.log("🔐 Setting up authentication tables...");

  // Read and execute schema
  const schema = readFileSync(join(__dirname, "schema.auth.sql"), "utf-8");
  db.exec(schema);

  console.log("✅ Authentication tables created successfully");

  // Check if user_id columns need to be added
  try {
    // Try to add user_id to company_formations
    db.exec("ALTER TABLE company_formations ADD COLUMN user_id TEXT");
    console.log("✅ Added user_id to company_formations");
  } catch (e) {
    if (e.message.includes("duplicate column")) {
      console.log("ℹ️  user_id already exists in company_formations");
    } else {
      console.error(
        "⚠️  Error adding user_id to company_formations:",
        e.message
      );
    }
  }

  try {
    // Try to add user_id to mailbox_subscriptions
    db.exec("ALTER TABLE mailbox_subscriptions ADD COLUMN user_id TEXT");
    console.log("✅ Added user_id to mailbox_subscriptions");
  } catch (e) {
    if (e.message.includes("duplicate column")) {
      console.log("ℹ️  user_id already exists in mailbox_subscriptions");
    } else {
      console.error(
        "⚠️  Error adding user_id to mailbox_subscriptions:",
        e.message
      );
    }
  }

  console.log("\n✅ Authentication setup complete!\n");
} catch (error) {
  console.error("❌ Error setting up authentication:", error);
  process.exit(1);
} finally {
  db.close();
}
