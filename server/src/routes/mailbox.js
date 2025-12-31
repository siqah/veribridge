import express from "express";
import prisma from "../db/prisma.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// GET /api/mailbox - Get all mail for authenticated user
// OPTIMIZED: Use Prisma ORM for type safety, single query with includes
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Get subscription with eager loading would be ideal, but no relation defined
    // So we do two quick queries with proper types
    const subscription = await prisma.mailboxSubscription.findFirst({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!subscription) {
      return res.json({ success: true, items: [] });
    }

    const items = await prisma.mailItem.findMany({
      where: { mailboxId: subscription.id },
      orderBy: { receivedDate: "desc" },
      take: 50,
      select: {
        id: true,
        subject: true,
        sender: true,
        scanUrl: true,
        isRead: true,
        receivedDate: true,
        mailType: true,
      },
    });

    // Transform to match frontend expectations
    const transformedItems = items.map((item) => ({
      id: item.id,
      title: item.subject,
      sender: item.sender,
      file_url: item.scanUrl,
      is_read: item.isRead,
      received_at: item.receivedDate,
      mail_type: item.mailType,
    }));

    res.json({ success: true, items: transformedItems });
  } catch (error) {
    console.error("Error fetching mailbox:", error);
    res.json({ success: true, items: [] });
  }
});

// PATCH /api/mailbox/:id/read - Mark mail as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.mailItem.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error("Error marking mail as read:", error);
    res.status(500).json({ error: "Failed to update mail status" });
  }
});

// POST /api/mailbox/upload - Admin uploads mail for a user
router.post("/upload", authenticateToken, async (req, res) => {
  try {
    // Verify admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@veribridge.co.ke";
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { user_id, title, sender, file_url } = req.body;

    if (!user_id || !title || !file_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user and subscription in parallel
    const [user, existingSubscription] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user_id },
        select: { email: true },
      }),
      prisma.mailboxSubscription.findFirst({
        where: { userId: user_id },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let subscriptionId = existingSubscription?.id;

    if (!subscriptionId) {
      const newSub = await prisma.mailboxSubscription.create({
        data: {
          userId: user_id,
          email: user.email,
          plan: "basic",
          address: "71-75 Shelton Street, Covent Garden, London WC2H 9JQ",
          status: "active",
          startDate: new Date(),
          autoRenew: true,
          amount: 0,
          currency: "KES",
        },
        select: { id: true },
      });
      subscriptionId = newSub.id;
    }

    const item = await prisma.mailItem.create({
      data: {
        mailboxId: subscriptionId,
        sender: sender || null,
        subject: title,
        scanUrl: file_url,
        mailType: "LETTER",
        status: "RECEIVED",
        isRead: false,
      },
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error("Error uploading mail:", error);
    res
      .status(500)
      .json({ error: "Failed to upload mail item", details: error.message });
  }
});

export default router;
