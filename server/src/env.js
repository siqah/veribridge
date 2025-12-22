import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables BEFORE anything else
dotenv.config({ path: join(__dirname, "../.env") });

// Debug: Verify it loaded
console.log(
  "🔧 Environment loaded. API Key present:",
  !!process.env.COMPANIES_HOUSE_API_KEY
);
