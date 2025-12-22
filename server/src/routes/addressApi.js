import express from "express";
import { apiAuth } from "../middleware/apiAuth.js";

const router = express.Router();

/**
 * Clean and format raw address string
 * Reuses existing address parsing logic from the frontend
 */
function cleanAddress(rawString) {
  if (!rawString || typeof rawString !== "string") {
    throw new Error("Invalid input: raw_string must be a non-empty string");
  }

  const input = rawString.trim();

  // Extract components using patterns
  const result = {
    original: input,
    formatted: {},
    metadata: {},
  };

  // Common Kenyan landmarks
  const landmarkKeywords = [
    "near",
    "opposite",
    "next to",
    "behind",
    "along",
    "off",
  ];
  const landmark = landmarkKeywords.find((kw) =>
    input.toLowerCase().includes(kw)
  );

  if (landmark) {
    const parts = input.split(new RegExp(landmark, "i"));
    if (parts.length > 1) {
      result.formatted.landmark = parts[1].trim().split(",")[0];
    }
  }

  // Extract street/road
  const roadPattern =
    /([\w\s]+(?:Road|Rd|Avenue|Ave|Street|St|Way|Drive|Dr|Lane))/i;
  const roadMatch = input.match(roadPattern);
  if (roadMatch) {
    result.formatted.street = roadMatch[1].trim();
  }

  // Extract city (common Kenyan cities)
  const cities = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Thika",
    "Malindi",
    "Kitale",
    "Garissa",
    "Kakamega",
    "Machakos",
    "Meru",
    "Nyeri",
    "Ruiru",
  ];
  const cityMatch = cities.find((city) => input.includes(city));
  if (cityMatch) {
    result.formatted.city = cityMatch;
  }

  // Extract estate/area
  const estateName = input
    .split(",")[0]
    .replace(/near|opposite|next to|behind|along|off/gi, "")
    .trim();
  if (estateName && !result.formatted.street?.includes(estateName)) {
    result.formatted.estate = estateName;
  }

  // Country (default to Kenya for Kenyan addresses)
  result.formatted.country = "Kenya";

  // Create formatted output
  const parts = [
    result.formatted.estate,
    result.formatted.street,
    result.formatted.landmark && `(${landmark} ${result.formatted.landmark})`,
    result.formatted.city,
    result.formatted.country,
  ].filter(Boolean);

  result.formatted.complete = parts.join(", ");

  // Quality score
  result.metadata.components = Object.keys(result.formatted).length - 1; // Exclude 'complete'
  result.metadata.confidence = Math.min(result.metadata.components / 5, 1);

  return result;
}

/**
 * POST /api/v1/clean-address
 * Public B2B API endpoint with authentication
 */
router.post("/clean-address", apiAuth, async (req, res) => {
  try {
    const { raw_string } = req.body;

    if (!raw_string) {
      return res.status(400).json({
        error: "Missing required field: raw_string",
      });
    }

    // Clean the address
    const result = cleanAddress(raw_string);

    // Track usage (would update database in production)
    console.log(`📍 Address API used: ${req.apiKey.userId} - "${raw_string}"`);

    res.json({
      success: true,
      input: raw_string,
      output: result.formatted,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("Address cleaning error:", error);
    res.status(400).json({
      error: "Address cleaning failed",
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/usage
 * Get API usage statistics (authenticated)
 */
router.get("/usage", apiAuth, async (req, res) => {
  try {
    // Mock usage data (would query database in production)
    const usage = {
      userId: req.apiKey.userId,
      period: "current_month",
      requestCount: 42,
      rateLimit: 1000,
      remaining: 958,
      resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    res.json({
      success: true,
      usage,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
