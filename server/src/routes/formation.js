import express from "express";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
// import multer from "multer";
// import { existsSync, mkdirSync } from "fs";
import companiesHouseService from "../services/companiesHouse.js";
import sanctionsService from "../services/sanctions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// SQLite connection
const db = new Database(join(__dirname, "../../veribridge.db"));

// TODO: Configure multer for certificate uploads once package is installed
// const uploadDir = join(__dirname, "../../uploads/certificates");
// if (!existsSync(uploadDir)) {
//   mkdirSync(uploadDir, { recursive: true });
// }
//
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${uuidv4()}.pdf`;
//     cb(null, uniqueName);
//   },
// });
//
// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype === "application/pdf") {
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF files are allowed"));
//     }
//   },
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
// });

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
    const cacheStmt = db.prepare(`
      SELECT is_available, suggestions 
      FROM uk_name_searches 
      WHERE search_query = ? AND datetime(expires_at) > datetime('now')
      ORDER BY searched_at DESC
      LIMIT 1
    `);

    const cached = cacheStmt.get(normalizedQuery);

    if (cached) {
      return res.json({
        available: Boolean(cached.is_available),
        suggestions: cached.suggestions ? JSON.parse(cached.suggestions) : [],
        cached: true,
      });
    }

    // Call Companies House API
    const result = await companiesHouseService.checkNameAvailability(query);

    // Cache the result (expires in 24 hours)
    const insertStmt = db.prepare(`
      INSERT INTO uk_name_searches (id, search_query, is_available, suggestions, expires_at)
      VALUES (?, ?, ?, ?, datetime('now', '+24 hours'))
    `);

    insertStmt.run(
      uuidv4(),
      normalizedQuery,
      result.available ? 1 : 0,
      JSON.stringify(result.suggestions || [])
    );

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
 */
router.post("/", async (req, res) => {
  try {
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
      userId,
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

    // Sanctions screening
    const sanctionsResult = await sanctionsService.screenPerson({
      fullName: directorName,
      country: "KE",
    });

    if (sanctionsResult.isHit) {
      console.warn(`⚠️  Sanctions hit for: ${directorName}`);

      return res.status(403).json({
        error: "Unable to process request. Please contact support.",
        code: "COMPLIANCE_CHECK_FAILED",
      });
    }

    // Calculate payment amount
    const paymentAmount = jurisdiction === "UK" ? 20000 : 25000;

    const formationId = uuidv4();

    // Insert formation order
    const insertStmt = db.prepare(`
      INSERT INTO company_formations (
        id, user_id, company_name, alt_name_1, alt_name_2,
        jurisdiction, company_type, industry_code,
        director_name, director_address, director_email, director_phone,
        payment_amount, sanctions_checked, sanctions_result, kyc_verified,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      formationId,
      userId || null,
      companyName,
      altName1 || null,
      altName2 || null,
      jurisdiction,
      companyType,
      industryCode || null,
      directorName,
      directorAddress,
      directorEmail || null,
      directorPhone || null,
      paymentAmount,
      1,
      JSON.stringify(sanctionsResult),
      userId ? 1 : 0,
      "PENDING"
    );

    // Log audit trail
    const auditStmt = db.prepare(`
      INSERT INTO formation_audit_log (id, formation_id, action, details)
      VALUES (?, ?, ?, ?)
    `);

    auditStmt.run(
      uuidv4(),
      formationId,
      "ORDER_CREATED",
      JSON.stringify({ companyName, jurisdiction, directorName })
    );

    // Admin notification
    console.log(`
🏢 NEW COMPANY FORMATION ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order ID: ${formationId}
Company: ${companyName}
Type: ${jurisdiction} ${companyType}
Director: ${directorName}
Amount: KES ${paymentAmount}
Status: PENDING PAYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);

    const formation = db
      .prepare("SELECT * FROM company_formations WHERE id = ?")
      .get(formationId);

    res.status(201).json({
      success: true,
      message: "Company formation order created successfully",
      order: {
        id: formation.id,
        companyName: formation.company_name,
        jurisdiction: formation.jurisdiction,
        companyType: formation.company_type,
        status: formation.status,
        paymentAmount: formation.payment_amount,
        createdAt: formation.created_at,
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

    const stmt = db.prepare("SELECT * FROM company_formations WHERE id = ?");
    const formation = stmt.get(id);

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

    let query = "SELECT * FROM company_formations WHERE 1=1";
    const params = [];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    if (userId) {
      query += " AND user_id = ?";
      params.push(userId);
    }

    query += " ORDER BY created_at DESC LIMIT 100";

    const stmt = db.prepare(query);
    const formations = stmt.all(...params);

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

    // Build update query
    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }

    if (adminNotes) {
      updates.push("admin_notes = ?");
      params.push(adminNotes);
    }

    if (registrationNumber) {
      updates.push("registration_number = ?");
      params.push(registrationNumber);
    }

    if (certificateUrl) {
      updates.push("certificate_url = ?");
      params.push(certificateUrl);
    }

    if (status === "COMPLETED") {
      updates.push("completed_at = datetime('now')");
    }

    updates.push("updated_at = datetime('now')");

    if (updates.length === 1) {
      // Only updated_at
      return res.status(400).json({ error: "No updates provided" });
    }

    params.push(id);

    const updateStmt = db.prepare(`
      UPDATE company_formations 
      SET ${updates.join(", ")}
      WHERE id = ?
    `);

    const result = updateStmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Formation order not found" });
    }

    // Log audit
    const auditStmt = db.prepare(`
      INSERT INTO formation_audit_log (id, formation_id, action, details)
      VALUES (?, ?, ?, ?)
    `);

    auditStmt.run(
      uuidv4(),
      id,
      "STATUS_UPDATED",
      JSON.stringify({ status, adminNotes })
    );

    const formation = db
      .prepare("SELECT * FROM company_formations WHERE id = ?")
      .get(id);

    res.json({
      success: true,
      message: "Formation order updated successfully",
      order: formation,
    });
  } catch (error) {
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

// Uncomment once multer is installed:
// router.post("/:id/upload-certificate", upload.single("certificate"), async (req, res) => {
//   try {
//     const { id } = req.params;
//
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//
//     const certificateUrl = `/uploads/certificates/${req.file.filename}`;
//
//     // Update formation with certificate URL
//     const updateStmt = db.prepare(`
//       UPDATE company_formations
//       SET certificate_url = ?, updated_at = datetime('now')
//       WHERE id = ?
//     `);
//
//     const result = updateStmt.run(certificateUrl, id);
//
//     if (result.changes === 0) {
//       return res.status(404).json({ error: "Formation order not found" });
//     }
//
//     // Log audit
//     const auditStmt = db.prepare(`
//       INSERT INTO formation_audit_log (id, formation_id, action, details)
//       VALUES (?, ?, ?, ?)
//     `);
//
//     auditStmt.run(
//       uuidv4(),
//       id,
//       "CERTIFICATE_UPLOADED",
//       JSON.stringify({ filename: req.file.filename })
//     );
//
//     res.json({
//       success: true,
//       message: "Certificate uploaded successfully",
//       certificateUrl,
//     });
//   } catch (error) {
//     console.error("Certificate upload error:", error);
//     res.status(500).json({ error: "Failed to upload certificate" });
//   }
// });

export default router;
