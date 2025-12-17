import express from "express";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const db = new Database(join(__dirname, "../../veribridge.db"));

/**
 * GET /api/mailbox/subscription
 * Get user's mailbox subscription and virtual address
 */
router.get("/subscription", async (req, res) => {
  try {
    const { userId } = req.query; // In production, get from auth token

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const subscription = db
      .prepare(
        `
      SELECT * FROM mailbox_subscriptions WHERE user_id = ?
    `
      )
      .get(userId);

    if (!subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        message: "No active subscription found",
      });
    }

    res.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        virtualAddress: subscription.virtual_address,
        location: subscription.location,
        tier: subscription.subscription_tier,
        status: subscription.status,
        monthlyFee: subscription.monthly_fee,
        nextBillingDate: subscription.next_billing_date,
        expiresAt: subscription.expires_at,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

/**
 * POST /api/mailbox/subscribe
 * Create a new mailbox subscription
 */
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, location, tier } = req.body;

    if (!userId || !location || !tier) {
      return res.status(400).json({
        error: "Missing required fields: userId, location, tier",
      });
    }

    // Check if user already has a subscription
    const existing = db
      .prepare(
        `
      SELECT id FROM mailbox_subscriptions WHERE user_id = ?
    `
      )
      .get(userId);

    if (existing) {
      return res.status(400).json({
        error: "User already has an active subscription",
      });
    }

    // Get available virtual address for location
    const address = db
      .prepare(
        `
      SELECT * FROM virtual_addresses 
      WHERE location = ? AND is_available = 1 
      LIMIT 1
    `
      )
      .get(location);

    if (!address) {
      return res.status(400).json({
        error: "No available addresses for this location",
      });
    }

    // Determine pricing
    const monthlyFee = tier === "PRO" ? 5000 : 2000;

    // Create subscription
    const subscriptionId = uuidv4();
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const virtualAddress = `${address.address_line1}, ${address.city}, ${address.postal_code}, ${address.country}`;

    db.prepare(
      `
      INSERT INTO mailbox_subscriptions (
        id, user_id, location, virtual_address, 
        subscription_tier, monthly_fee, next_billing_date, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      subscriptionId,
      userId,
      location,
      virtualAddress,
      tier,
      monthlyFee,
      nextBillingDate.toISOString(),
      expiresAt.toISOString()
    );

    // Mark address as assigned
    db.prepare(
      `
      UPDATE virtual_addresses 
      SET is_available = 0, assigned_to_user = ? 
      WHERE id = ?
    `
    ).run(userId, address.id);

    const subscription = db
      .prepare(
        `
      SELECT * FROM mailbox_subscriptions WHERE id = ?
    `
      )
      .get(subscriptionId);

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription: {
        id: subscription.id,
        virtualAddress: subscription.virtual_address,
        location: subscription.location,
        tier: subscription.subscription_tier,
        monthlyFee: subscription.monthly_fee,
      },
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

/**
 * GET /api/mailbox/mail
 * Get all mail items for user
 */
router.get("/mail", async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Get user's mailbox
    const mailbox = db
      .prepare(
        `
      SELECT id FROM mailbox_subscriptions WHERE user_id = ?
    `
      )
      .get(userId);

    if (!mailbox) {
      return res.json({
        success: true,
        items: [],
        count: 0,
        unreadCount: 0,
      });
    }

    // Build query
    let query = "SELECT * FROM mail_items WHERE mailbox_id = ?";
    const params = [mailbox.id];

    if (status) {
      query += " AND status = ?";
      params.push(status);
    }

    query += " ORDER BY received_date DESC";

    const items = db.prepare(query).all(...params);

    const unreadCount = db
      .prepare(
        `
      SELECT COUNT(*) as count FROM mail_items 
      WHERE mailbox_id = ? AND is_read = 0
    `
      )
      .get(mailbox.id).count;

    res.json({
      success: true,
      items,
      count: items.length,
      unreadCount,
    });
  } catch (error) {
    console.error("Get mail error:", error);
    res.status(500).json({ error: "Failed to fetch mail items" });
  }
});

/**
 * GET /api/mailbox/mail/:id
 * Get specific mail item (marks as read)
 */
router.get("/mail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const item = db.prepare("SELECT * FROM mail_items WHERE id = ?").get(id);

    if (!item) {
      return res.status(404).json({ error: "Mail item not found" });
    }

    // Mark as read
    if (!item.is_read) {
      db.prepare(
        `
        UPDATE mail_items SET is_read = 1 WHERE id = ?
      `
      ).run(id);
      item.is_read = 1;
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get mail item error:", error);
    res.status(500).json({ error: "Failed to fetch mail item" });
  }
});

/**
 * POST /api/mailbox/mail/:id/forward
 * Request mail forwarding
 */
router.post("/mail/:id/forward", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userId,
      destinationAddress,
      destinationCity,
      destinationCountry,
      shippingMethod,
    } = req.body;

    const item = db.prepare("SELECT * FROM mail_items WHERE id = ?").get(id);

    if (!item) {
      return res.status(404).json({ error: "Mail item not found" });
    }

    // Calculate forwarding cost
    const isInternational =
      destinationCountry && destinationCountry !== "Kenya";
    let cost = isInternational ? 1500 : 500;

    if (shippingMethod === "EXPRESS") cost *= 1.5;
    if (shippingMethod === "PRIORITY") cost *= 2;

    const requestId = uuidv4();

    db.prepare(
      `
      INSERT INTO forwarding_requests (
        id, mail_item_id, user_id, destination_address,
        destination_city, destination_country, shipping_method,
        forwarding_cost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      requestId,
      id,
      userId,
      destinationAddress,
      destinationCity,
      destinationCountry,
      shippingMethod || "STANDARD",
      cost
    );

    // Update mail item status
    db.prepare(
      `
      UPDATE mail_items SET status = 'FORWARDED' WHERE id = ?
    `
    ).run(id);

    const request = db
      .prepare(
        `
      SELECT * FROM forwarding_requests WHERE id = ?
    `
      )
      .get(requestId);

    res.status(201).json({
      success: true,
      message: "Forwarding request created",
      request,
      cost,
    });
  } catch (error) {
    console.error("Forward mail error:", error);
    res.status(500).json({ error: "Failed to create forwarding request" });
  }
});

/**
 * POST /api/mailbox/admin/mail (Admin only)
 * Log new mail received
 */
router.post("/admin/mail", async (req, res) => {
  try {
    const {
      mailboxId,
      sender,
      mailType,
      subject,
      scanUrl,
      thumbnailUrl,
      weightGrams,
    } = req.body;

    const mailId = uuidv4();
    const receivedDate = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO mail_items (
        id, mailbox_id, sender, mail_type, subject,
        received_date, scan_url, thumbnail_url, weight_grams
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      mailId,
      mailboxId,
      sender,
      mailType || "LETTER",
      subject,
      receivedDate,
      scanUrl,
      thumbnailUrl,
      weightGrams
    );

    const item = db
      .prepare("SELECT * FROM mail_items WHERE id = ?")
      .get(mailId);

    res.status(201).json({
      success: true,
      message: "Mail item logged",
      item,
    });
  } catch (error) {
    console.error("Log mail error:", error);
    res.status(500).json({ error: "Failed to log mail item" });
  }
});

/**
 * DELETE /api/mailbox/mail/:id
 * Request mail disposal
 */
router.delete("/mail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    db.prepare(
      `
      UPDATE mail_items SET status = 'DISPOSED' WHERE id = ?
    `
    ).run(id);

    res.json({
      success: true,
      message: "Mail marked for disposal",
    });
  } catch (error) {
    console.error("Delete mail error:", error);
    res.status(500).json({ error: "Failed to dispose mail" });
  }
});

export default router;
