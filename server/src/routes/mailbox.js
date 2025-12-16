import express from "express";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Mock database
const mailboxItems = new Map();

// Mock subscription data
const mockSubscription = {
  status: "ACTIVE",
  plan: "Digital Mailbox Pro",
  price: 500,
  currency: "KES",
  billingCycle: "monthly",
  virtualAddress: "Suite 404, Westlands Plaza, Waiyaki Way, Nairobi, Kenya",
  nextBillingDate: new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString(),
  startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
};

// Seed some mock mail items
function seedMockData() {
  const mockItems = [
    {
      id: uuidv4(),
      sender: "Kenya Revenue Authority",
      subject: "Tax Compliance Certificate",
      receivedDate: "2024-12-10",
      mailType: "official",
      status: "unread",
      scannedImageUrl: "/mock/envelope1.jpg",
      thumbnailUrl: "/mock/envelope1_thumb.jpg",
    },
    {
      id: uuidv4(),
      sender: "Safaricom PLC",
      subject: "M-PESA Statement",
      receivedDate: "2024-12-08",
      mailType: "letter",
      status: "read",
      scannedImageUrl: "/mock/envelope2.jpg",
      thumbnailUrl: "/mock/envelope2_thumb.jpg",
    },
    {
      id: uuidv4(),
      sender: "Amazon Web Services",
      subject: "Invoice for December 2024",
      receivedDate: "2024-12-05",
      mailType: "letter",
      status: "read",
      scannedImageUrl: "/mock/envelope3.jpg",
      thumbnailUrl: "/mock/envelope3_thumb.jpg",
    },
  ];

  mockItems.forEach((item) => {
    item.createdAt = new Date(item.receivedDate).toISOString();
    mailboxItems.set(item.id, item);
  });
}

// Initialize mock data
seedMockData();

/**
 * GET /api/mailbox
 * List user's mailbox items
 */
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    let items = Array.from(mailboxItems.values());

    // Filter by status if provided
    if (status) {
      items = items.filter((item) => item.status === status);
    }

    // Sort by received date (most recent first)
    items.sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));

    res.json({
      success: true,
      items,
      count: items.length,
      unreadCount: items.filter((item) => item.status === "unread").length,
    });
  } catch (error) {
    console.error("Error fetching mailbox items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/mailbox/:id
 * Get specific mailbox item
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const item = mailboxItems.get(id);

    if (!item) {
      return res.status(404).json({ error: "Mail item not found" });
    }

    // Mark as read
    if (item.status === "unread") {
      item.status = "read";
      item.readAt = new Date().toISOString();
      mailboxItems.set(id, item);
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Error fetching mail item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/mailbox/subscription
 * Get mailbox subscription details
 */
router.get("/subscription/status", async (req, res) => {
  try {
    res.json({
      success: true,
      subscription: mockSubscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/mailbox/:id/status
 * Update mail item status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const item = mailboxItems.get(id);
    if (!item) {
      return res.status(404).json({ error: "Mail item not found" });
    }

    const validStatuses = ["unread", "read", "archived", "forwarded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    item.status = status;
    if (status === "archived") {
      item.archivedAt = new Date().toISOString();
    }

    mailboxItems.set(id, item);

    res.json({
      success: true,
      message: "Status updated",
      item,
    });
  } catch (error) {
    console.error("Error updating mail status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
