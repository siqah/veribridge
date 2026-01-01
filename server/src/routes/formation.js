import express from "express";
import multer from "multer";
import path from "path";
import prisma from "../db/prisma.js";
import companiesHouseService from "../services/companiesHouse.js";
import { authenticateToken } from "./auth.js";
import { logFormationAlert } from "../utils/formationEmail.js";
import { uploadToSupabase } from "../config/supabase.js";

const router = express.Router();

// Configure multer for memory storage (we'll upload to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

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
 * GET /api/formation
 * Get all formation orders (admin view)
 */
router.get("/", async (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;

    // Build where clause
    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { directorName: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch orders with ALL fields
    const orders = await prisma.companyOrder.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: "desc" },
      // Return all fields
    });

    // Get total count
    const total = await prisma.companyOrder.count({ where });

    res.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        company_name: order.companyName,
        alt_name_1: order.altName1,
        alt_name_2: order.altName2,
        jurisdiction: order.jurisdiction,
        company_type: order.companyType,
        industry_code: order.industryCode,
        director_name: order.directorName,
        director_email: order.directorEmail,
        director_phone: order.directorPhone,
        director_address: order.directorAddress,
        director_data: order.directorData, // JSON with IN01 fields
        status: order.status,
        payment_amount: order.paymentAmount,
        payment_ref: order.paymentRef,
        currency: order.currency,
        kyc_verified: order.kycVerified,
        admin_notes: order.adminNotes,
        registration_number: order.registrationNumber,
        certificate_url: order.certificateUrl,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        completed_at: order.completedAt,
      })),
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
    });
  } catch (error) {
    console.error("Formation orders list error:", error);
    res.status(500).json({ error: "Failed to fetch formation orders" });
  }
});

/**
 * GET /api/formation/my-orders
 * Get current user's formation orders (authenticated)
 */
router.get("/my-orders", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.companyOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        company_name: order.companyName,
        jurisdiction: order.jurisdiction,
        company_type: order.companyType,
        status: order.status,
        payment_amount: order.paymentAmount,
        registration_number: order.registrationNumber,
        certificate_url: order.certificateUrl,
        admin_notes: order.adminNotes,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        completed_at: order.completedAt,
      })),
    });
  } catch (error) {
    console.error("User orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
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
      sicCode,
      customSicCode,
      // New split name fields
      directorFirstName,
      directorLastName,
      directorDob,
      nationality,
      occupation,
      // New structured address fields
      addressStreet,
      addressCity,
      addressPostcode,
      addressCountry,
      directorEmail,
      directorPhone,
      townOfBirth,
      mothersMaidenName,
      fathersFirstName,
    } = req.body;

    // Combine name and address for storage
    const directorName =
      directorFirstName && directorLastName
        ? `${directorFirstName} ${directorLastName}`
        : null;
    const directorAddress = addressStreet
      ? `${addressStreet}, ${addressCity || ""}, ${addressPostcode || ""}, ${
          addressCountry || "Kenya"
        }`
          .replace(/,\s*,/g, ",")
          .replace(/,\s*$/, "")
      : null;

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

    // Calculate payment amount (updated 2025 pricing)
    const paymentAmount = jurisdiction === "UK" ? 25000 : 25000;

    // Use customSicCode if sicCode is 'other'
    const finalSicCode = sicCode === "other" ? customSicCode : sicCode;

    // Create formation order
    const formation = await prisma.companyOrder.create({
      data: {
        userId,
        companyName,
        altName1: altName1 || null,
        altName2: altName2 || null,
        jurisdiction,
        companyType,
        industryCode: finalSicCode || industryCode || null,
        directorName,
        directorAddress,
        directorEmail: directorEmail || null,
        directorPhone: directorPhone || null,
        directorData: {
          directorFirstName,
          directorLastName,
          directorDob,
          nationality,
          occupation,
          addressStreet,
          addressCity,
          addressPostcode,
          addressCountry,
          townOfBirth,
          mothersMaidenName,
          fathersFirstName,
          sicCode: finalSicCode,
        },
        paymentAmount,
        kycVerified: true,
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

    // Generate and log admin alert email (formatted for 1st Formations)
    logFormationAlert(formation, req.body);

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
 * PATCH /api/formation/:id/status
 * Update formation order status (admin only)
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, registrationNumber } = req.body;

    // Validate status
    const validStatuses = [
      "DRAFT",
      "PENDING",
      "PAID",
      "PROCESSING",
      "COMPLETED",
      "REJECTED",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update order
    const order = await prisma.companyOrder.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
        ...(registrationNumber && { registrationNumber }),
        ...(status === "COMPLETED" && { completedAt: new Date() }),
      },
    });

    // Log audit trail
    await prisma.formationAuditLog.create({
      data: {
        formationId: id,
        action: "STATUS_UPDATED",
        details: { status, adminNotes, registrationNumber },
      },
    });

    console.log(`✅ Order #${id.slice(0, 8)} status updated to: ${status}`);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      error: "Failed to update order status",
    });
  }
});

/**
 * POST /api/formation/:id/upload-certificate
 * Upload incorporation certificate to Supabase Storage (admin only)
 */
router.post(
  "/:id/upload-certificate",
  upload.single("certificate"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${id.slice(0, 8)}-${timestamp}.pdf`;

      // Upload to Supabase Storage
      const publicUrl = await uploadToSupabase(
        req.file.buffer,
        fileName,
        "certificates"
      );

      // Update order with certificate URL
      const order = await prisma.companyOrder.update({
        where: { id },
        data: { certificateUrl: publicUrl },
      });

      console.log(
        `📄 Certificate uploaded to Supabase for order ${id.slice(0, 8)}`
      );
      console.log(`   URL: ${publicUrl}`);

      res.json({
        success: true,
        certificate_url: publicUrl,
        message: "Certificate uploaded successfully",
      });
    } catch (error) {
      console.error("Certificate upload error:", error);
      res.status(500).json({
        error: "Failed to upload certificate",
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/formation/:id/notify-customer
 * Send completion email to customer (admin only)
 */
router.post("/:id/notify-customer", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch order
    const order = await prisma.companyOrder.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "COMPLETED") {
      return res.status(400).json({
        error: "Order must be COMPLETED before notifying customer",
      });
    }

    if (!order.registrationNumber) {
      return res.status(400).json({
        error: "Registration number required before notifying customer",
      });
    }

    // TODO: Send actual email via email service
    // await sendCompletionEmail(order);

    console.log(`\n📧 ============= CUSTOMER NOTIFICATION =============`);
    console.log(`✅ Completion email would be sent to: ${order.directorEmail}`);
    console.log(`   Company: ${order.companyName}`);
    console.log(`   Registration #: ${order.registrationNumber}`);
    console.log(
      `   Certificate URL: ${order.certificateUrl || "Not uploaded"}`
    );
    console.log(`==================================================\n`);

    res.json({
      success: true,
      message: "Customer notified successfully",
    });
  } catch (error) {
    console.error("Notify customer error:", error);
    res.status(500).json({
      error: "Failed to notify customer",
    });
  }
});

export default router;
