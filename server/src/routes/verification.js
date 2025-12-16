import express from "express";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const router = express.Router();

// In-memory store (replace with PostgreSQL in production)
const verifications = new Map();

/**
 * Generate unique verification ID
 * Format: VB-[TIMESTAMP]-[RANDOM]
 */
function generateVerificationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VB-${timestamp}-${random}`;
}

/**
 * POST /api/verify/create
 * Create a new verification record
 */
router.post("/create", async (req, res) => {
  try {
    const {
      fullName,
      idNumber,
      formattedAddress,
      country,
      phone,
      email,
      platform,
      score,
    } = req.body;

    // Validate required fields
    if (!fullName || !formattedAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: fullName, formattedAddress",
      });
    }

    const id = uuidv4();
    const verificationId = generateVerificationId();
    const verificationUrl = `${
      process.env.BASE_URL || "http://localhost:3001"
    }/verify/${verificationId}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      width: 150,
      margin: 1,
      color: { dark: "#1e40af", light: "#ffffff" },
    });

    const verification = {
      id,
      verificationId,
      verificationUrl,
      qrCode,
      fullName,
      idNumberHash: idNumber ? hashIdNumber(idNumber) : null,
      formattedAddress,
      country: country || "Kenya",
      phone: phone || null,
      email: email || null,
      platform: platform || "Google Play Console",
      score: score || 0,
      status: "VERIFIED",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Store verification
    verifications.set(verificationId, verification);

    res.status(201).json({
      success: true,
      data: {
        verificationId,
        verificationUrl,
        qrCode,
        status: verification.status,
        expiresAt: verification.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating verification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create verification",
    });
  }
});

/**
 * GET /api/verify/:id
 * Get verification details (public lookup)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const verification = verifications.get(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: "Verification not found",
      });
    }

    // Return public data only (no sensitive info)
    res.json({
      success: true,
      data: {
        verificationId: verification.verificationId,
        status: verification.status,
        fullName: verification.fullName,
        country: verification.country,
        platform: verification.platform,
        createdAt: verification.createdAt,
        expiresAt: verification.expiresAt,
        isExpired: new Date(verification.expiresAt) < new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching verification:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch verification",
    });
  }
});

/**
 * GET /api/verify/:id/certificate
 * Get verification certificate data
 */
router.get("/:id/certificate", async (req, res) => {
  try {
    const { id } = req.params;
    const verification = verifications.get(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: "Verification not found",
      });
    }

    res.json({
      success: true,
      data: {
        verificationId: verification.verificationId,
        verificationUrl: verification.verificationUrl,
        qrCode: verification.qrCode,
        fullName: verification.fullName,
        formattedAddress: verification.formattedAddress,
        country: verification.country,
        platform: verification.platform,
        score: verification.score,
        status: verification.status,
        createdAt: verification.createdAt,
        expiresAt: verification.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch certificate",
    });
  }
});

/**
 * GET /api/verify/stats
 * Get verification statistics
 */
router.get("/stats/summary", async (req, res) => {
  try {
    const total = verifications.size;
    const verified = Array.from(verifications.values()).filter(
      (v) => v.status === "VERIFIED"
    ).length;

    res.json({
      success: true,
      data: {
        total,
        verified,
        pending: total - verified,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
});

/**
 * Simple hash for ID number (for privacy)
 */
function hashIdNumber(idNumber) {
  // Simple hash for demo - use bcrypt in production
  return Buffer.from(idNumber).toString("base64").slice(0, 8) + "****";
}

export default router;
