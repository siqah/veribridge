import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables BEFORE anything else
dotenv.config({ path: join(__dirname, "../.env") });

// Note: Logger will be imported after env is loaded in index.js
