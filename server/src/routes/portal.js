import express from "express";
import crypto from "crypto";
import prisma from "../db/prisma.js";

const router = express.Router();

/**
 * Generate a secure access token for invoice
 */
function generateAccessToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * GET /api/portal/invoice/:token
 * Public endpoint - Get invoice by access token (no auth)
 */
router.get("/invoice/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken: token },
      include: {
        user: {
          include: {
            userProfile: true,
          },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Update view count
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        viewCount: invoice.viewCount + 1,
        lastViewedAt: new Date(),
      },
    });

    // Format response (don't expose sensitive user data)
    const business = invoice.user.userProfile;

    res.json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        items: invoice.items,
        subtotal: invoice.subtotal / 100,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount / 100,
        total: invoice.total / 100,
        currency: invoice.currency,
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        notes: invoice.notes,
        pdfUrl: invoice.pdfUrl,
        createdAt: invoice.createdAt,
      },
      business: business
        ? {
            name: business.businessName,
            email: business.businessEmail,
            phone: business.businessPhone,
            address: business.businessAddress,
            logo: business.businessLogo,
            taxId: business.taxId,
          }
        : null,
    });
  } catch (error) {
    console.error("Portal invoice fetch error:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

/**
 * POST /api/portal/invoice/:token/mpesa
 * Initiate M-Pesa STK push for invoice payment
 */
router.post("/invoice/:token/mpesa", async (req, res) => {
  try {
    const { token } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken: token },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    if (invoice.currency !== "KES") {
      return res
        .status(400)
        .json({ error: "M-Pesa only supports KES payments" });
    }

    // TODO: Integrate with actual M-Pesa STK Push API
    // For now, simulate the request
    const mpesaResponse = {
      success: true,
      message: "STK push sent. Please check your phone to complete payment.",
      checkoutRequestId: `ws_CO_${Date.now()}`,
    };

    // Store the checkout request for callback verification
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paymentMethod: "mpesa",
        paymentRef: mpesaResponse.checkoutRequestId,
      },
    });

    res.json(mpesaResponse);
  } catch (error) {
    console.error("M-Pesa payment error:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

/**
 * POST /api/portal/invoice/:token/paystack
 * Initialize Paystack payment for invoice
 */
router.post("/invoice/:token/paystack", async (req, res) => {
  try {
    const { token } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken: token },
      include: {
        user: {
          include: { userProfile: true },
        },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({ error: "Invoice already paid" });
    }

    const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    // Convert amount to kobo/cents (Paystack expects smallest unit)
    const amountInSmallestUnit = invoice.total; // Already in cents

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: invoice.clientEmail || "customer@example.com",
          amount: amountInSmallestUnit,
          currency: invoice.currency,
          reference: `INV-${invoice.id}-${Date.now()}`,
          callback_url: `${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/invoice/${token}/callback`,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoiceNumber,
            access_token: token,
          },
        }),
      }
    );

    const data = await paystackResponse.json();

    if (data.status) {
      // Store payment reference
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paymentMethod: "paystack",
          paymentRef: data.data.reference,
        },
      });

      res.json({
        success: true,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
      });
    } else {
      res
        .status(400)
        .json({ error: data.message || "Payment initialization failed" });
    }
  } catch (error) {
    console.error("Paystack payment error:", error);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

/**
 * POST /api/portal/webhook/paystack
 * Paystack webhook for payment confirmation
 */
router.post("/webhook/paystack", async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      if (metadata?.invoice_id) {
        await prisma.invoice.update({
          where: { id: metadata.invoice_id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            paymentRef: reference,
          },
        });

        console.log(`✅ Invoice ${metadata.invoice_number} paid via Paystack`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * POST /api/portal/webhook/mpesa
 * M-Pesa callback for payment confirmation
 */
router.post("/webhook/mpesa", async (req, res) => {
  try {
    const { Body } = req.body;

    if (!Body?.stkCallback) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const { stkCallback } = Body;
    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback;

    // Find invoice by checkout request ID
    const invoice = await prisma.invoice.findFirst({
      where: { paymentRef: CheckoutRequestID },
    });

    if (!invoice) {
      console.error(
        "Invoice not found for M-Pesa callback:",
        CheckoutRequestID
      );
      return res.status(200).json({ received: true }); // Acknowledge even if not found
    }

    if (ResultCode === 0) {
      // Payment successful
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      console.log(`✅ Invoice ${invoice.invoiceNumber} paid via M-Pesa`);
    } else {
      console.log(
        `❌ M-Pesa payment failed for ${invoice.invoiceNumber}: ${ResultDesc}`
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("M-Pesa webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

/**
 * GET /api/portal/invoice/:token/status
 * Check payment status
 */
router.get("/invoice/:token/status", async (req, res) => {
  try {
    const { token } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { accessToken: token },
      select: {
        status: true,
        paidAt: true,
        paymentMethod: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({
      success: true,
      status: invoice.status,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
