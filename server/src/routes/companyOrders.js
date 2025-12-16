import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Mock database for now (will integrate with PostgreSQL)
const orders = new Map();

/**
 * POST /api/company-orders
 * Create a new company formation order
 */
router.post("/", async (req, res) => {
  try {
    const { companyType, proposedNames, directorData, passportNumber } =
      req.body;

    // Validation
    if (!companyType || !["UK_LTD", "US_LLC"].includes(companyType)) {
      return res.status(400).json({
        error: "Invalid company type. Must be UK_LTD or US_LLC",
      });
    }

    if (
      !proposedNames ||
      !Array.isArray(proposedNames) ||
      proposedNames.length !== 3
    ) {
      return res.status(400).json({
        error: "Please provide exactly 3 proposed company names",
      });
    }

    if (!directorData || !directorData.fullName || !directorData.email) {
      return res.status(400).json({
        error: "Director information is required (fullName, email, phone)",
      });
    }

    // Create order
    const order = {
      id: uuidv4(),
      companyType,
      proposedNames,
      directorData,
      passportNumber,
      status: "PENDING",
      paymentStatus: "PENDING",
      adminNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.set(order.id, order);

    // Admin notification (console for now, email later)
    console.log(`\n🔔 NEW COMPANY ORDER RECEIVED:
    Order ID: ${order.id}
    Type: ${companyType}
    Names: ${proposedNames.join(", ")}
    Director: ${directorData.fullName}
    Status: PENDING
    `);

    res.status(201).json({
      success: true,
      message: "Company formation order created successfully",
      order: {
        id: order.id,
        companyType: order.companyType,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating company order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/company-orders/:id
 * Get order details
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = orders.get(id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/company-orders
 * List all orders (for testing, would filter by user in production)
 */
router.get("/", async (req, res) => {
  try {
    const allOrders = Array.from(orders.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      success: true,
      orders: allOrders,
      count: allOrders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/company-orders/:id/status
 * Update order status (admin only - no auth for MVP)
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = orders.get(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "REJECTED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update order
    if (status) order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    order.updatedAt = new Date().toISOString();

    if (status === "COMPLETED") {
      order.completedAt = new Date().toISOString();
    }

    orders.set(id, order);

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
