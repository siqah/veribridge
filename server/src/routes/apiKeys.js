import express from "express";
import { v4 as uuidv4 } from "uuid";
import {
  generateApiKey,
  hashApiKey,
  getKeyPrefix,
  maskApiKey,
} from "../middleware/apiAuth.js";

const router = express.Router();

// Mock database
const apiKeys = new Map();

/**
 * POST /api/keys/generate
 * Generate a new API key
 */
router.post("/generate", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "API key name is required",
      });
    }

    // Generate new API key
    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);
    const keyPrefix = getKeyPrefix(apiKey);

    // Create key record
    const keyRecord = {
      id: uuidv4(),
      userId: "mock-user-id", // Would come from auth in production
      name: name.trim(),
      description: description || null,
      keyHash,
      keyPrefix,
      status: "active",
      usageCount: 0,
      lastUsedAt: null,
      rateLimitPerDay: 1000,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      revokedAt: null,
    };

    apiKeys.set(keyRecord.id, keyRecord);

    console.log(`✅ API key generated: ${keyPrefix}... for "${name}"`);

    // Return full key only once
    res.status(201).json({
      success: true,
      message: "API key generated successfully",
      apiKey: apiKey, // ONLY shown once!
      keyInfo: {
        id: keyRecord.id,
        name: keyRecord.name,
        prefix: keyRecord.keyPrefix,
        status: keyRecord.status,
        createdAt: keyRecord.createdAt,
      },
      warning: "Save this API key securely. It will not be shown again!",
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/keys
 * List user's API keys
 */
router.get("/", async (req, res) => {
  try {
    const userKeys = Array.from(apiKeys.values())
      .filter((key) => key.userId === "mock-user-id") // Filter by user in production
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return keys without sensitive data
    const sanitizedKeys = userKeys.map((key) => ({
      id: key.id,
      name: key.name,
      description: key.description,
      prefix: key.keyPrefix,
      maskedKey: maskApiKey(key.keyPrefix + "dummy"),
      status: key.status,
      usageCount: key.usageCount,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
    }));

    res.json({
      success: true,
      keys: sanitizedKeys,
      count: sanitizedKeys.length,
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/keys/:id/revoke
 * Revoke an API key
 */
router.delete("/:id/revoke", async (req, res) => {
  try {
    const { id } = req.params;
    const keyRecord = apiKeys.get(id);

    if (!keyRecord) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Check ownership (in production)
    if (keyRecord.userId !== "mock-user-id") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Revoke the key
    keyRecord.status = "revoked";
    keyRecord.revokedAt = new Date().toISOString();
    apiKeys.set(id, keyRecord);

    console.log(`🔒 API key revoked: ${keyRecord.keyPrefix}...`);

    res.json({
      success: true,
      message: "API key revoked successfully",
      key: {
        id: keyRecord.id,
        name: keyRecord.name,
        status: keyRecord.status,
        revokedAt: keyRecord.revokedAt,
      },
    });
  } catch (error) {
    console.error("Error revoking API key:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
