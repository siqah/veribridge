import express from "express";
import prisma from "../db/prisma.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Verify admin
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@veribridge.co.ke";
    if (req.user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

export default router;
