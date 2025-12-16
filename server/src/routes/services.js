import express from "express";

const router = express.Router();

/**
 * Upsell Services Configuration
 */
const SERVICES = {
  ukCompany: {
    id: "uk-company",
    name: "UK Company Formation",
    shortName: "Stripe Bridge",
    description:
      "Register a UK Limited Company to accept Stripe and PayPal payments worldwide",
    price: 5000,
    currency: "KES",
    features: [
      "UK Companies House registration guidance",
      "Stripe account setup assistance",
      "Wise Business account guidance",
      "Tax compliance checklist",
      "Registered office address options",
    ],
    timeline: "5-10 business days",
    popular: true,
  },
  virtualMailbox: {
    id: "virtual-mailbox",
    name: "Virtual Business Address",
    shortName: "Digital Mailbox",
    description:
      "Get a permanent business address in Nairobi for platform verification",
    price: 500,
    currency: "KES",
    billing: "monthly",
    features: [
      "Professional business address",
      "Mail receiving and scanning",
      "PIN verification letters accepted",
      "Business registration address",
      "WhatsApp mail notifications",
    ],
    note: "For business verification only (AdSense, Upwork Enterprise)",
  },
  invoicePro: {
    id: "invoice-pro",
    name: "Invoice Generator Pro",
    shortName: "Western Invoicing",
    description:
      "Generate professional invoices that impress international clients",
    price: 200,
    currency: "KES",
    billing: "monthly",
    features: [
      "Professional PDF invoices",
      "Your verified address in header",
      "Bank wire transfer instructions (IBAN/SWIFT)",
      "KRA Turnover Tax calculator",
      "Payment tracking",
      "Multiple currencies",
    ],
    freeTier: ["Watermarked invoices", "Basic templates"],
  },
  addressApi: {
    id: "address-api",
    name: "Address Cleaning API",
    shortName: "B2B API",
    description:
      "Clean and standardize Kenyan addresses for logistics and banking",
    price: 5,
    currency: "KES",
    billing: "per call",
    features: [
      "REST API access",
      "Standardized address output",
      "Geocoding",
      "Bulk processing",
      "Webhook integration",
    ],
    target: "B2B - Banks, Insurance, Logistics",
    volumeDiscounts: [
      { calls: 1000, pricePerCall: 4 },
      { calls: 10000, pricePerCall: 3 },
      { calls: 100000, pricePerCall: 2 },
    ],
  },
};

/**
 * GET /api/services
 * Get all available services
 */
router.get("/", async (req, res) => {
  res.json({
    success: true,
    data: Object.values(SERVICES),
  });
});

/**
 * GET /api/services/:id
 * Get specific service details
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const service = Object.values(SERVICES).find((s) => s.id === id);

  if (!service) {
    return res.status(404).json({
      success: false,
      error: "Service not found",
    });
  }

  res.json({
    success: true,
    data: service,
  });
});

/**
 * POST /api/services/:id/interest
 * Register interest in a service (lead capture)
 */
router.post("/:id/interest", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, verificationId } = req.body;

  const service = Object.values(SERVICES).find((s) => s.id === id);

  if (!service) {
    return res.status(404).json({
      success: false,
      error: "Service not found",
    });
  }

  // In production, store this lead in database
  console.log(`New lead for ${service.name}:`, {
    name,
    email,
    phone,
    verificationId,
  });

  res.json({
    success: true,
    message: `Thank you for your interest in ${service.name}. We will contact you shortly.`,
    data: {
      serviceId: id,
      serviceName: service.name,
      leadCaptured: true,
    },
  });
});

/**
 * POST /api/services/address-api/clean
 * Address cleaning API (B2B)
 */
router.post("/address-api/clean", async (req, res) => {
  const { address, country } = req.body;

  if (!address) {
    return res.status(400).json({
      success: false,
      error: "Address is required",
    });
  }

  // Clean the address (basic implementation)
  const cleaned = cleanAddress(address, country);

  res.json({
    success: true,
    data: {
      original: address,
      cleaned: cleaned.formatted,
      components: cleaned.components,
      confidence: cleaned.confidence,
      warnings: cleaned.warnings,
    },
  });
});

/**
 * Basic address cleaning logic
 */
function cleanAddress(address, country = "Kenya") {
  const colloquialisms = [
    "near",
    "opposite",
    "next to",
    "behind",
    "besides",
    "adjacent to",
    "close to",
    "around",
    "off",
    "stage",
    "junction",
    "corner",
    "before",
    "after",
    "along",
  ];

  let cleaned = address.trim();
  const warnings = [];

  // Remove P.O. Box
  if (/p\.?o\.?\s*box/i.test(cleaned)) {
    warnings.push("P.O. Box removed");
    cleaned = cleaned.replace(/p\.?o\.?\s*box\s*\d+,?\s*/gi, "").trim();
  }

  // Remove colloquialisms
  colloquialisms.forEach((word) => {
    if (cleaned.toLowerCase().includes(word)) {
      warnings.push(`Removed "${word}"`);
      cleaned = cleaned
        .replace(new RegExp(`\\b${word}\\b[^,]*,?`, "gi"), "")
        .trim();
    }
  });

  // Clean up extra commas and spaces
  cleaned = cleaned
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/, "")
    .replace(/^\s*,/, "")
    .replace(/\s+/g, " ")
    .trim();

  // Add country if not present
  if (!cleaned.toLowerCase().includes(country.toLowerCase())) {
    cleaned += `, ${country}`;
  }

  // Parse components
  const parts = cleaned.split(",").map((p) => p.trim());
  const components = {
    street: parts[0] || "",
    area: parts[1] || "",
    city: parts[2] || "",
    country: parts[parts.length - 1] || country,
  };

  return {
    formatted: cleaned,
    components,
    confidence:
      warnings.length === 0
        ? 0.95
        : Math.max(0.5, 0.95 - warnings.length * 0.1),
    warnings,
  };
}

export default router;
