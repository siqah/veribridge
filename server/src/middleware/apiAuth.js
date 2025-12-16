import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Generate a cryptographically secure API key
 */
export function generateApiKey() {
  // Generate 32 random bytes and convert to hex (64 characters)
  const key = crypto.randomBytes(32).toString("hex");

  // Prefix for identification (vb = VeriBridge)
  const fullKey = `vb_${key}`;

  return fullKey;
}

/**
 * Hash an API key for secure storage
 */
export async function hashApiKey(apiKey) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(apiKey, salt);
}

/**
 * Verify an API key against its hash
 */
export async function verifyApiKey(apiKey, hash) {
  return bcrypt.compare(apiKey, hash);
}

/**
 * Extract key prefix for display (first 12 characters: vb_12345678)
 */
export function getKeyPrefix(apiKey) {
  return apiKey.substring(0, 12);
}

/**
 * Mask an API key for display
 */
export function maskApiKey(apiKey) {
  const prefix = getKeyPrefix(apiKey);
  return `${prefix}${"*".repeat(52)}`;
}

/**
 * API authentication middleware
 * Checks x-api-key header and validates against stored keys
 */
export async function apiAuth(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        error: "Missing API key",
        message: "Please provide an API key in the x-api-key header",
      });
    }

    if (!apiKey.startsWith("vb_")) {
      return res.status(401).json({
        error: "Invalid API key format",
        message: 'API key must start with "vb_"',
      });
    }

    // In production, this would query the database
    // For now, we'll use a mock validation
    const isValid = await validateApiKeyMock(apiKey);

    if (!isValid) {
      return res.status(401).json({
        error: "Invalid API key",
        message: "The provided API key is invalid or has been revoked",
      });
    }

    // Attach user info to request (would come from database)
    req.apiKey = {
      key: apiKey,
      userId: "mock-user-id",
      keyId: "mock-key-id",
    };

    next();
  } catch (error) {
    console.error("API auth error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * Mock API key validation (replace with database lookup)
 */
async function validateApiKeyMock(apiKey) {
  // For testing purposes, accept any key starting with vb_
  // In production, this would:
  // 1. Hash the provided key
  // 2. Look up the hash in the database
  // 3. Check if the key is active (not revoked/expired)
  // 4. Update last_used_at and usage_count

  return apiKey.startsWith("vb_") && apiKey.length === 67;
}

export default {
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  getKeyPrefix,
  maskApiKey,
  apiAuth,
};
