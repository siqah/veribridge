import express from "express";
import { v4 as uuidv4 } from "uuid";
import { generateInvoicePDF } from "../services/pdfService.js";

const router = express.Router();

// Mock database (replace with PostgreSQL later)
const invoices = new Map();

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
router.post("/", async (req, res) => {
  try {
    const { clientName, currency, lineItems, paymentDetails, userProfile } =
      req.body;

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
      ...item,
      amount: Number((item.quantity * item.rate).toFixed(2)),
    }));

    const subtotal = processedLineItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const kraTax = calculateKraTax(subtotal, currency);
    const total = subtotal + kraTax;

    // Create invoice
    const invoice = {
      id: uuidv4(),
      invoiceNumber: generateInvoiceNumber(),
      clientName,
      currency,
      lineItems: processedLineItems,
      subtotal: Number(subtotal.toFixed(2)),
      kraTax: Number(kraTax.toFixed(2)),
      total: Number(total.toFixed(2)),
      paymentDetails: paymentDetails || null,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pdfUrl: null,
    };

    // Generate PDF
    try {
      const pdfResult = await generateInvoicePDF({
        ...invoice,
        userProfile: userProfile || {},
      });
      invoice.pdfUrl = pdfResult.url;
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      // Continue without PDF for now
      invoice.pdfUrl = null;
    }

    // Save invoice
    invoices.set(invoice.id, invoice);

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
 * GET /api/invoices/:id
 * Get invoice by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = invoices.get(id);

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
 * GET /api/invoices
 * List all invoices (would filter by user in production)
 */
router.get("/", async (req, res) => {
  try {
    const allInvoices = Array.from(invoices.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      invoices: allInvoices,
      count: allInvoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
