import express from "express";
import crypto from "crypto";
import prisma from "../db/prisma.js";
import { authenticateToken } from "./auth.js";

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
 * Calculate next due date based on frequency
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);

  switch (frequency) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date;
}

/**
 * POST /api/recurring
 * Create a new recurring invoice template
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      clientName,
      clientEmail,
      clientPhone,
      items,
      currency,
      notes,
      frequency,
      startDate,
      endDate,
      dayOfMonth,
    } = req.body;

    // Validation
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ error: "Client name is required" });
    }

    if (!clientEmail || !clientEmail.trim()) {
      return res
        .status(400)
        .json({ error: "Client email is required for recurring invoices" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one line item is required" });
    }

    if (
      !frequency ||
      !["weekly", "biweekly", "monthly", "quarterly", "yearly"].includes(
        frequency
      )
    ) {
      return res.status(400).json({ error: "Invalid frequency" });
    }

    const nextDueDate = startDate ? new Date(startDate) : new Date();

    const recurring = await prisma.recurringInvoice.create({
      data: {
        userId,
        clientName,
        clientEmail,
        clientPhone,
        items,
        currency: currency || "KES",
        notes,
        frequency,
        nextDueDate,
        endDate: endDate ? new Date(endDate) : null,
        dayOfMonth: dayOfMonth || nextDueDate.getDate(),
        isActive: true,
      },
    });

    console.log(`✅ Recurring invoice created for ${clientName}`);

    res.status(201).json({
      success: true,
      message: "Recurring invoice created successfully",
      recurring,
    });
  } catch (error) {
    console.error("Error creating recurring invoice:", error);
    res.status(500).json({ error: "Failed to create recurring invoice" });
  }
});

/**
 * GET /api/recurring
 * List user's recurring invoices
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activeOnly } = req.query;

    const where = {
      userId,
      ...(activeOnly === "true" && { isActive: true }),
    };

    const recurring = await prisma.recurringInvoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    res.json({
      success: true,
      recurring: recurring.map((r) => ({
        ...r,
        generatedCount: r._count.invoices,
      })),
    });
  } catch (error) {
    console.error("Error fetching recurring invoices:", error);
    res.status(500).json({ error: "Failed to fetch recurring invoices" });
  }
});

/**
 * GET /api/recurring/:id
 * Get single recurring invoice
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const recurring = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
      include: {
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!recurring) {
      return res.status(404).json({ error: "Recurring invoice not found" });
    }

    res.json({
      success: true,
      recurring,
    });
  } catch (error) {
    console.error("Error fetching recurring invoice:", error);
    res.status(500).json({ error: "Failed to fetch recurring invoice" });
  }
});

/**
 * PATCH /api/recurring/:id
 * Update recurring invoice
 */
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const {
      clientName,
      clientEmail,
      clientPhone,
      items,
      currency,
      notes,
      frequency,
      endDate,
      isActive,
    } = req.body;

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Recurring invoice not found" });
    }

    const recurring = await prisma.recurringInvoice.update({
      where: { id },
      data: {
        ...(clientName && { clientName }),
        ...(clientEmail && { clientEmail }),
        ...(clientPhone !== undefined && { clientPhone }),
        ...(items && { items }),
        ...(currency && { currency }),
        ...(notes !== undefined && { notes }),
        ...(frequency && { frequency }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: "Recurring invoice updated",
      recurring,
    });
  } catch (error) {
    console.error("Error updating recurring invoice:", error);
    res.status(500).json({ error: "Failed to update recurring invoice" });
  }
});

/**
 * DELETE /api/recurring/:id
 * Deactivate recurring invoice
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Recurring invoice not found" });
    }

    await prisma.recurringInvoice.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "Recurring invoice deactivated",
    });
  } catch (error) {
    console.error("Error deactivating recurring invoice:", error);
    res.status(500).json({ error: "Failed to deactivate recurring invoice" });
  }
});

/**
 * POST /api/recurring/:id/generate
 * Manually generate an invoice from recurring template
 */
router.post("/:id/generate", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const recurring = await prisma.recurringInvoice.findFirst({
      where: { id, userId },
    });

    if (!recurring) {
      return res.status(404).json({ error: "Recurring invoice not found" });
    }

    // Get user profile for invoice prefix
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    const invoicePrefix = userProfile?.invoicePrefix || "INV";

    // Calculate amounts
    const items = recurring.items;
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const taxRate = recurring.currency === "KES" ? 1.5 : 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        invoiceNumber: generateInvoiceNumber(invoicePrefix),
        clientName: recurring.clientName,
        clientEmail: recurring.clientEmail,
        clientPhone: recurring.clientPhone,
        items: items,
        subtotal: Math.round(subtotal * 100),
        taxRate,
        taxAmount: Math.round(taxAmount * 100),
        total: Math.round(total * 100),
        currency: recurring.currency,
        notes: recurring.notes,
        status: "SENT",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        sentAt: new Date(),
        accessToken: generateAccessToken(),
        recurringId: recurring.id,
      },
    });

    // Update recurring invoice
    await prisma.recurringInvoice.update({
      where: { id },
      data: {
        totalGenerated: recurring.totalGenerated + 1,
        lastGeneratedAt: new Date(),
        nextDueDate: calculateNextDueDate(
          recurring.nextDueDate,
          recurring.frequency
        ),
      },
    });

    res.status(201).json({
      success: true,
      message: "Invoice generated from recurring template",
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: total,
        portalLink: `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/invoice/${invoice.accessToken}`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

/**
 * Process all due recurring invoices (for cron job)
 */
export async function processRecurringInvoices() {
  console.log("🔄 Processing recurring invoices...");

  try {
    const now = new Date();

    // Find all active recurring invoices due today or earlier
    const dueRecurring = await prisma.recurringInvoice.findMany({
      where: {
        isActive: true,
        nextDueDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    console.log(`Found ${dueRecurring.length} due recurring invoices`);

    for (const recurring of dueRecurring) {
      try {
        const invoicePrefix =
          recurring.user.userProfile?.invoicePrefix || "INV";
        const items = recurring.items;
        const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.rate,
          0
        );
        const taxRate = recurring.currency === "KES" ? 1.5 : 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        // Create invoice
        const invoice = await prisma.invoice.create({
          data: {
            userId: recurring.userId,
            invoiceNumber: generateInvoiceNumber(invoicePrefix),
            clientName: recurring.clientName,
            clientEmail: recurring.clientEmail,
            clientPhone: recurring.clientPhone,
            items: items,
            subtotal: Math.round(subtotal * 100),
            taxRate,
            taxAmount: Math.round(taxAmount * 100),
            total: Math.round(total * 100),
            currency: recurring.currency,
            notes: recurring.notes,
            status: "SENT",
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sentAt: new Date(),
            accessToken: generateAccessToken(),
            recurringId: recurring.id,
          },
        });

        // Update recurring invoice
        await prisma.recurringInvoice.update({
          where: { id: recurring.id },
          data: {
            totalGenerated: recurring.totalGenerated + 1,
            lastGeneratedAt: new Date(),
            nextDueDate: calculateNextDueDate(
              recurring.nextDueDate,
              recurring.frequency
            ),
          },
        });

        console.log(
          `✅ Generated invoice ${invoice.invoiceNumber} for ${recurring.clientName}`
        );

        // TODO: Send email notification to client
      } catch (err) {
        console.error(
          `❌ Failed to generate invoice for recurring ${recurring.id}:`,
          err
        );
      }
    }

    console.log("🔄 Recurring invoice processing complete");
  } catch (error) {
    console.error("Recurring invoice processing error:", error);
  }
}

export default router;
