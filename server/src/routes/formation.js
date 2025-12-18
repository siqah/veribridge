import express from "express";
import prisma from "../db/prisma.js";
import companiesHouseService from "../services/companiesHouse.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

/**
 * GET /api/formation/uk-check-name
 * Check if a UK company name is available
 */
router.get("/uk-check-name", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        error: "Company name must be at least 3 characters",
      });
    }

    const normalizedQuery = query.trim().toUpperCase();

    // Check cache first
    const cached = await prisma.ukNameSearch.findFirst({
      where: {
        searchQuery: normalizedQuery,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
      orderBy: {
        searchedAt: "desc",
      },
    });

    if (cached) {
      return res.json({
        available: cached.isAvailable,
        suggestions: cached.suggestions || [],
        cached: true,
      });
    }

    // Call Companies House API
    const result = await companiesHouseService.checkNameAvailability(query);

    // Cache the result (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.ukNameSearch.create({
      data: {
        searchQuery: normalizedQuery,
        isAvailable: result.available,
        suggestions: result.suggestions || [],
        expiresAt,
      },
    });

    res.json({
      available: result.available,
      exactMatch: result.exactMatch,
      suggestions: result.suggestions || [],
      cached: false,
    });
  } catch (error) {
    console.error("UK name check error:", error);
    res.status(500).json({
      error: "Failed to check company name availability",
      message: error.message,
    });
  }
});

/**
 * POST /api/formation
 * Create a new company formation order
 * Requires authentication
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Get userId from authenticated token (required)
    const userId = req.user.userId;

    const {
      companyName,
      altName1,
      altName2,
      jurisdiction,
      companyType,
      industryCode,
      directorName,
      directorAddress,
      directorEmail,
      directorPhone,
    } = req.body;

    // Validation
    if (!companyName || !jurisdiction || !companyType) {
      return res.status(400).json({
        error:
          "Missing required fields: companyName, jurisdiction, companyType",
      });
    }

    if (!["UK", "US"].includes(jurisdiction)) {
      return res.status(400).json({
        error: "Jurisdiction must be UK or US",
      });
    }

    if (!["LTD", "LLC"].includes(companyType)) {
      return res.status(400).json({
        error: "Company type must be LTD or LLC",
      });
    }

    // Calculate payment amount
    const paymentAmount = jurisdiction === "UK" ? 20000 : 25000;

    // Create formation order
    const formation = await prisma.companyOrder.create({
      data: {
        userId,
        companyName,
        altName1: altName1 || null,
        altName2: altName2 || null,
        jurisdiction,
        companyType,
        industryCode: industryCode || null,
        directorName,
        directorAddress,
        directorEmail: directorEmail || null,
        directorPhone: directorPhone || null,
        paymentAmount,
        kycVerified: true, // Always verified since user is authenticated
        status: "PENDING",
      },
    });

    // Log audit trail
    await prisma.formationAuditLog.create({
      data: {
        formationId: formation.id,
        action: "ORDER_CREATED",
        details: { companyName, jurisdiction, directorName },
      },
    });

    // Admin notification
    console.log(`
🏢 NEW COMPANY FORMATION ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${formation.id}
Company: ${companyName}
Type: ${jurisdiction} ${companyType}
Director: ${directorName}
Amount: KES ${paymentAmount}
Status: PENDING PAYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    res.status(201).json({
      success: true,
      message: "Company formation order created successfully",
      order: {
        id: formation.id,
        companyName: formation.companyName,
        jurisdiction: formation.jurisdiction,
        companyType: formation.companyType,
        status: formation.status,
        paymentAmount: formation.paymentAmount,
        createdAt: formation.createdAt,
      },
    });
  } catch (error) {
    console.error("Formation order error:", error);
    res.status(500).json({
      error: "Failed to create formation order",
      message: error.message,
    });
  }
});

/**
 * GET /api/formation/:id
 * Get formation order details
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const formation = await prisma.companyOrder.findUnique({
      where: { id },
    });

    if (!formation) {
      return res.status(404).json({ error: "Formation order not found" });
    }

    res.json({
      success: true,
      order: formation,
    });
  } catch (error) {
    console.error("Get formation error:", error);
    res.status(500).json({ error: "Failed to fetch formation order" });
  }
});

/**
 * GET /api/formation
 * List all formation orders
 */
router.get("/", async (req, res) => {
  try {
    const { status, userId } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const formations = await prisma.companyOrder.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    res.json({
      success: true,
      orders: formations,
      count: formations.length,
    });
  } catch (error) {
    console.error("List formations error:", error);
    res.status(500).json({ error: "Failed to fetch formation orders" });
  }
});

/**
 * PATCH /api/formation/:id/status
 * Update formation order status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, registrationNumber, certificateUrl } = req.body;

    const validStatuses = [
      "DRAFT",
      "PENDING",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "REJECTED",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Build update data
    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (registrationNumber) {
      updateData.registrationNumber = registrationNumber;
    }

    if (certificateUrl) {
      updateData.certificateUrl = certificateUrl;
    }

    if (status === "COMPLETED") {
      updateData.completedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    // Update formation
    const formation = await prisma.companyOrder.update({
      where: { id },
      data: updateData,
    });

    // Log audit
    await prisma.formationAuditLog.create({
      data: {
        formationId: id,
        action: "STATUS_UPDATED",
        details: { status, adminNotes },
      },
    });

    res.json({
      success: true,
      message: "Formation order updated successfully",
      order: formation,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma "Record not found" error
      return res.status(404).json({ error: "Formation order not found" });
    }
    console.error("Update formation error:", error);
    res.status(500).json({ error: "Failed to update formation order" });
  }
});

/**
 * POST /api/formation/:id/upload-certificate
 * Upload incorporation certificate
 * TODO: Enable once multer is installed
 */
router.post("/:id/upload-certificate", async (req, res) => {
  // Temporary stub until multer is installed
  res.status(501).json({
    error:
      "Certificate upload temporarily disabled. Admin can update certificate_url manually via status endpoint.",
  });
});

export default router;
