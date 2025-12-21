import express from "express";
import { createClient } from "@supabase/supabase-js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for admin operations
);

// GET /api/mailbox - Get all mail for authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("mailbox_items")
      .select("*")
      .eq("user_id", req.user.userId)
      .order("received_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, items: data });
  } catch (error) {
    console.error("Error fetching mailbox:", error);
    res.status(500).json({ error: "Failed to fetch mailbox items" });
  }
});

// PATCH /api/mailbox/:id/read - Mark mail as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("mailbox_items")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", req.user.userId) // Ensure user owns this mail
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, item: data });
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

    const { user_id, order_id, title, sender, file_url } = req.body;

    // Validate required fields
    if (!user_id || !title || !file_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert mail item
    const { data, error } = await supabase
      .from("mailbox_items")
      .insert({
        user_id,
        order_id,
        title,
        sender,
        file_url,
        created_by: req.user.userId,
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Send email notification to user

    res.json({ success: true, item: data });
  } catch (error) {
    console.error("Error uploading mail:", error);
    res.status(500).json({ error: "Failed to upload mail item" });
  }
});

export default router;
