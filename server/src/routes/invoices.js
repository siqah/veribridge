import express from "express";
import crypto from "crypto";
import prisma from "../db/prisma.js";
import { authenticateToken } from "./auth.js";
import { generateInvoicePDF } from "../services/pdfService.js";

const router = express.Router();

/**
 * Generate invoice number in format: INV-YYYY-MM-XXXX
 */
function generateInvoiceNumber(prefix = "INV") {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}-${month}-${random}`;
}

/**
 * Generate secure access token for client portal
 */
function generateAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculate KRA turnover tax (1.5% for KES currency)
 */
function calculateKraTax(subtotal, currency) {
  return currency === "KES" ? subtotal * 0.015 : 0;
}

/**
 * POST /api/invoices
 * Create a new invoice and generate PDF
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientAddress,
      currency,
      lineItems,
      paymentDetails,
      dueDate,
      notes,
    } = req.body;

    // Validation
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ error: "Client name is required" });
    }

    if (
      !currency ||
      ![
        "KES",
        "USD",
        "GBP",
        "EUR",
        "NGN",
        "ZAR",
        "UGX",
        "TZS",
        "INR",
        "AED",
      ].includes(currency)
    ) {
      return res.status(400).json({
        error: "Invalid currency",
      });
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        error: "At least one line item is required",
      });
    }

    // Validate line items
    for (const item of lineItems) {
      if (!item.description || item.quantity <= 0 || item.rate <= 0) {
        return res.status(400).json({
          error:
            "Each line item must have description, quantity > 0, and rate > 0",
        });
      }
    }

    // Calculate amounts
    const processedLineItems = lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      amount: Number((item.quantity * item.rate).toFixed(2)),
    }));

    const subtotal = processedLineItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const kraTax = calculateKraTax(subtotal, currency);
    const total = subtotal + kraTax;

    // Get user profile for PDF generation
    let userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // Get invoice prefix from profile or use default
    const invoicePrefix = userProfile?.invoicePrefix || "INV";

    // Create invoice in database with access token for portal
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: generateInvoiceNumber(invoicePrefix),
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        items: processedLineItems,
        subtotal: Math.round(subtotal * 100), // Store as cents
        taxRate: currency === "KES" ? 1.5 : 0,
        taxAmount: Math.round(kraTax * 100),
        total: Math.round(total * 100),
        currency,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: "DRAFT",
        accessToken: generateAccessToken(), // For client portal
      },
    });

    // Generate PDF
    let pdfUrl = null;
    try {
      const pdfResult = await generateInvoicePDF({
        ...invoice,
        subtotal: subtotal,
        kraTax: kraTax,
        total: total,
        lineItems: processedLineItems,
        userProfile: userProfile || {
          businessName: req.user.fullName || "My Business",
          businessEmail: req.user.email,
        },
      });
      pdfUrl = pdfResult.url;

      // Update invoice with PDF URL
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
      });
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      // Continue without PDF
    }

    console.log(`✅ Invoice created: ${invoice.invoiceNumber}`);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        total: total,
        currency: invoice.currency,
        kraTax: kraTax,
        pdfUrl: pdfUrl,
        status: invoice.status,
        createdAt: invoice.createdAt,
        accessToken: invoice.accessToken,
        portalLink: `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/invoice/${invoice.accessToken}`,
      },
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

/**
 * GET /api/invoices
 * List user's invoices with filters and pagination
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, search, page = 1, limit = 20 } = req.query;

    // Build filter conditions
    const where = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { clientName: { contains: search, mode: "insensitive" } },
          { invoiceNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Get total count
    const total = await prisma.invoice.count({ where });

    // Get invoices with pagination
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    // Convert amounts back from cents
    const formattedInvoices = invoices.map((inv) => ({
      ...inv,
      subtotal: inv.subtotal / 100,
      taxAmount: inv.taxAmount / 100,
      total: inv.total / 100,
    }));

    res.json({
      success: true,
      invoices: formattedInvoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/invoices/:id
 * Get single invoice by ID
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Convert amounts back from cents
    const formattedInvoice = {
      ...invoice,
      subtotal: invoice.subtotal / 100,
      taxAmount: invoice.taxAmount / 100,
      total: invoice.total / 100,
    };

    res.json({
      success: true,
      invoice: formattedInvoice,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/invoices/:id
 * Update invoice (only if status = DRAFT)
 */
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const {
      clientName,
      clientEmail,
      clientAddress,
      lineItems,
      dueDate,
      notes,
    } = req.body;

    // Check if invoice exists and belongs to user
    const existing = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (existing.status !== "DRAFT") {
      return res.status(400).json({
        error: "Only draft invoices can be edited",
      });
    }

    // Recalculate if line items changed
    let updateData = {
      clientName,
      clientEmail,
      clientAddress,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      notes,
    };

    if (lineItems && Array.isArray(lineItems)) {
      const processedLineItems = lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number((item.quantity * item.rate).toFixed(2)),
      }));

      const subtotal = processedLineItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      const kraTax = calculateKraTax(subtotal, existing.currency);
      const total = subtotal + kraTax;

      updateData = {
        ...updateData,
        items: processedLineItems,
        subtotal: Math.round(subtotal * 100),
        taxAmount: Math.round(kraTax * 100),
        total: Math.round(total * 100),
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Invoice updated successfully",
      invoice: {
        ...invoice,
        subtotal: invoice.subtotal / 100,
        taxAmount: invoice.taxAmount / 100,
        total: invoice.total / 100,
      },
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({
      error: "Failed to update invoice",
      details: error.message,
    });
  }
});

/**
 * DELETE /api/invoices/:id
 * Soft delete invoice (change status to CANCELLED)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({
      success: true,
      message: "Invoice cancelled successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: "Failed to delete invoice" });
  }
});

/**
 * PATCH /api/invoices/:id/send
 * Mark invoice as sent
 */
router.patch("/:id/send", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await prisma.invoice.update({
      where: { id },
      data: { status: "SENT" },
    });

    // TODO: Implement email sending when client email is provided

    res.json({
      success: true,
      message: "Invoice marked as sent",
    });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});

/**
 * PATCH /api/invoices/:id/payment
 * Mark invoice as paid/unpaid
 */
router.patch("/:id/payment", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { paid } = req.body;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await prisma.invoice.update({
      where: { id },
      data: {
        status: paid
          ? "PAID"
          : invoice.status === "PAID"
          ? "SENT"
          : invoice.status,
        paidAt: paid ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: paid ? "Invoice marked as paid" : "Invoice marked as unpaid",
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

export default router;
