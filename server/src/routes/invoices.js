import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "./auth.js";
import { generateInvoicePDF } from "../services/pdfService.js";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate invoice number in format: INV-YYYY-MM-XXXX
 */
function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `INV-${year}-${month}-${random}`;
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
    const userId = req.user.id;
    const {
      clientName,
      clientEmail,
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

    if (!currency || !["KES", "USD", "GBP", "EUR"].includes(currency)) {
      return res.status(400).json({
        error: "Invalid currency. Must be KES, USD, GBP, or EUR",
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

    // Create invoice with line items in database
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: generateInvoiceNumber(),
        clientName,
        clientEmail,
        clientAddress,
        currency,
        subtotal: Number(subtotal.toFixed(2)),
        kraTax: Number(kraTax.toFixed(2)),
        total: Number(total.toFixed(2)),
        bankName: paymentDetails?.bankName,
        accountNumber: paymentDetails?.accountNumber,
        iban: paymentDetails?.iban,
        swift: paymentDetails?.swift,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        status: "DRAFT",
        paymentStatus: "UNPAID",
        lineItems: {
          create: processedLineItems,
        },
      },
      include: {
        lineItems: true,
      },
    });

    // Generate PDF
    try {
      const pdfResult = await generateInvoicePDF({
        ...invoice,
        lineItems: processedLineItems,
        userProfile: userProfile || {
          businessName: req.user.fullName || "My Business",
          businessEmail: req.user.email,
        },
      });

      // Update invoice with PDF URL
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: pdfResult.url },
      });

      invoice.pdfUrl = pdfResult.url;
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
        total: invoice.total,
        currency: invoice.currency,
        kraTax: invoice.kraTax,
        pdfUrl: invoice.pdfUrl,
        status: invoice.status,
        paymentStatus: invoice.paymentStatus,
        createdAt: invoice.createdAt,
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
    const userId = req.user.id;
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

    // Build filter conditions
    const where = {
      userId,
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
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
      include: {
        lineItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    res.json({
      success: true,
      invoices,
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
    const userId = req.user.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId, // Ensure user owns this invoice
      },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({
      success: true,
      invoice,
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
    const userId = req.user.id;
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
      // Delete existing line items and create new ones
      await prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: id },
      });

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
        subtotal: Number(subtotal.toFixed(2)),
        kraTax: Number(kraTax.toFixed(2)),
        total: Number(total.toFixed(2)),
        lineItems: {
          create: processedLineItems,
        },
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        lineItems: true,
      },
    });

    res.json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
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
    const userId = req.user.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    await prisma.invoice.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
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
 * Send invoice via email to client
 */
router.patch("/:id/send", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: { lineItems: true },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (!invoice.clientEmail) {
      return res.status(400).json({
        error: "Client email is required to send invoice",
      });
    }

    // TODO: Implement email sending in Phase 4
    // await sendInvoiceEmail(invoice, invoice.clientEmail, invoice.pdfUrl);

    // Update status
    await prisma.invoice.update({
      where: { id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Invoice sent successfully (email pending implementation)",
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
    const userId = req.user.id;
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
        paymentStatus: paid ? "PAID" : "UNPAID",
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
