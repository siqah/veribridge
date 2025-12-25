import express from "express";
import { createClient } from "@supabase/supabase-js";
import { authenticateToken } from "./auth.js";
import cache from "../utils/cache.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for admin operations
);

// GET /api/mailbox - Get all mail for authenticated user (with caching)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // FIXED: Use supabaseId instead of userId (local DB id)
    // Mail items use Supabase UUID as user_id
    const supabaseId = req.user.supabaseId;
    const cacheKey = `mailbox:${supabaseId}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Only select needed fields to reduce data transfer
    const { data, error } = await supabase
      .from("mailbox_items")
      .select(
        "id, user_id, order_id, title, sender, file_url, received_at, is_read"
      )
      .eq("user_id", supabaseId) // Use Supabase ID, not local DB ID
      .order("received_at", { ascending: false })
      .limit(100); // Add limit to prevent loading too much data

    if (error) throw error;

    const response = { success: true, items: data || [] };

    // Cache for 30 seconds
    cache.set(cacheKey, response, 30000);

    res.json(response);
  } catch (error) {
    console.error("Error fetching mailbox:", error);
    res.status(500).json({ error: "Failed to fetch mailbox items" });
  }
});

// PATCH /api/mailbox/:id/read - Mark mail as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const supabaseId = req.user.supabaseId;

    const { data, error } = await supabase
      .from("mailbox_items")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", supabaseId) // Ensure user owns this mail
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    cache.del(`mailbox:${supabaseId}`);

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
        // created_by omitted - will be null (admin uses local auth, not Supabase Auth)
      })
      .select()
      .single();

    if (error) throw error;

    // Send email notification to user
    try {
      // Get user's email from Supabase Auth
      const { data: userData, error: userError } =
        await supabase.auth.admin.getUserById(user_id);

      if (!userError && userData?.user?.email) {
        const { sendMailNotification } = await import(
          "../services/emailService.js"
        );
        await sendMailNotification(userData.user.email, {
          title,
          sender,
          receivedDate: data.received_at,
        });
      }
    } catch (emailError) {
      // Don't fail upload if email notification fails
      console.error("Failed to send mail notification:", emailError);
    }

    // Invalidate cache for the user who received mail
    cache.del(`mailbox:${user_id}`);

    res.json({ success: true, item: data });
  } catch (error) {
    console.error("Error uploading mail:", error);
    res.status(500).json({ error: "Failed to upload mail item" });
  }
});

export default router;
