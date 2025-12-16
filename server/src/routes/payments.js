import express from "express";
import axios from "axios";

const router = express.Router();

// MPESA Configuration
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || "",
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || "",
  shortcode: process.env.MPESA_SHORTCODE || "174379",
  passkey: process.env.MPESA_PASSKEY || "",
  callbackUrl:
    process.env.MPESA_CALLBACK_URL ||
    "http://localhost:3001/api/payments/callback",
  environment: process.env.MPESA_ENV || "sandbox",
};

// In-memory payment store (replace with PostgreSQL in production)
const payments = new Map();

/**
 * Get MPESA access token
 */
async function getMpesaToken() {
  const url =
    MPESA_CONFIG.environment === "production"
      ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
      : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(
    `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
  ).toString("base64");

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}

/**
 * Generate MPESA password
 */
function generatePassword() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
  ).toString("base64");
  return { password, timestamp };
}

/**
 * POST /api/payments/stk-push
 * Initiate MPESA STK Push
 */
router.post("/stk-push", async (req, res) => {
  try {
    const { phone, amount, verificationId, service } = req.body;

    // Validate required fields
    if (!phone || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: phone, amount",
      });
    }

    // Format phone number (remove leading 0, add 254)
    let formattedPhone = phone.replace(/\s/g, "").replace(/^0/, "");
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    // Check if MPESA is configured
    if (!MPESA_CONFIG.consumerKey) {
      // Demo mode - simulate payment
      const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;

      payments.set(paymentId, {
        id: paymentId,
        phone: formattedPhone,
        amount,
        verificationId,
        service: service || "verification",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        demo: true,
        message: "Demo mode - MPESA not configured",
        data: {
          paymentId,
          checkoutRequestId: `demo-${paymentId}`,
          status: "PENDING",
        },
      });
    }

    // Get MPESA token
    const token = await getMpesaToken();
    const { password, timestamp } = generatePassword();

    const url =
      MPESA_CONFIG.environment === "production"
        ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    const response = await axios.post(
      url,
      {
        BusinessShortCode: MPESA_CONFIG.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CONFIG.callbackUrl,
        AccountReference: verificationId || "VeriBridge",
        TransactionDesc: `VeriBridge ${service || "Verification"} Payment`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Store payment record
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
    payments.set(paymentId, {
      id: paymentId,
      checkoutRequestId: response.data.CheckoutRequestID,
      phone: formattedPhone,
      amount,
      verificationId,
      service: service || "verification",
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        paymentId,
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
        status: "PENDING",
        message: "Check your phone for the MPESA prompt",
      },
    });
  } catch (error) {
    console.error(
      "MPESA STK Push error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      error: "Failed to initiate payment",
      details: error.response?.data?.errorMessage || error.message,
    });
  }
});

/**
 * POST /api/payments/callback
 * MPESA callback webhook
 */
router.post("/callback", async (req, res) => {
  try {
    console.log("MPESA Callback:", JSON.stringify(req.body, null, 2));

    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } =
      Body.stkCallback;

    // Find payment by checkout request ID
    let payment = null;
    for (const [id, p] of payments) {
      if (p.checkoutRequestId === CheckoutRequestID) {
        payment = p;
        break;
      }
    }

    if (payment) {
      if (ResultCode === 0) {
        // Payment successful
        const metadata = CallbackMetadata?.Item || [];
        const receipt = metadata.find(
          (i) => i.Name === "MpesaReceiptNumber"
        )?.Value;

        payment.status = "COMPLETED";
        payment.mpesaReceipt = receipt;
        payment.completedAt = new Date().toISOString();

        console.log(`Payment ${payment.id} completed. Receipt: ${receipt}`);
      } else {
        // Payment failed
        payment.status = "FAILED";
        payment.failureReason = ResultDesc;

        console.log(`Payment ${payment.id} failed: ${ResultDesc}`);
      }
    }

    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("MPESA Callback error:", error);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

/**
 * GET /api/payments/:id
 * Check payment status
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = payments.get(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        mpesaReceipt: payment.mpesaReceipt,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payment status",
    });
  }
});

/**
 * Service pricing
 */
const PRICING = {
  basic: {
    amount: 0,
    name: "Basic Verification",
    features: ["Address formatting", "Affidavit template"],
  },
  premium: {
    amount: 500,
    name: "Premium Verification",
    features: ["QR code", "Online lookup", "Priority support"],
  },
  ukCompany: {
    amount: 5000,
    name: "UK Company Formation",
    features: ["Company registration guide", "Stripe setup", "Wise setup"],
  },
  virtualMailbox: {
    amount: 500,
    name: "Virtual Mailbox",
    features: ["Monthly subscription", "Physical mail scanning"],
  },
  invoicePro: {
    amount: 200,
    name: "Invoice Generator Pro",
    features: ["Monthly subscription", "Branded invoices", "Tax calculation"],
  },
};

/**
 * GET /api/payments/pricing
 * Get service pricing
 */
router.get("/pricing/all", async (req, res) => {
  res.json({
    success: true,
    data: PRICING,
  });
});

export default router;
