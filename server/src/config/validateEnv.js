/**
 * Environment Variable Validation
 * Ensures all required environment variables are present at startup
 */

const requiredVars = [
  "DATABASE_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_JWT_SECRET",
  "JWT_SECRET",
  "ADMIN_EMAIL",
];

const optionalVars = [
  "PORT",
  "NODE_ENV",
  "CLIENT_URL",
  "COMPANIES_HOUSE_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
];

export function validateEnv() {
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => console.error(`   - ${varName}`));
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Log optional variables that are missing (as warnings)
  const missingOptional = optionalVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingOptional.length > 0) {
    console.warn("⚠️  Optional environment variables not set:");
    missingOptional.forEach((varName) => console.warn(`   - ${varName}`));
  }

  console.log("✅ All required environment variables validated");
}

export default validateEnv;
