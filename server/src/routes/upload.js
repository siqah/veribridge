import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// POST /api/upload/mail - Upload PDF to Supabase Storage
router.post(
  "/mail",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      // Verify admin
      const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@veribridge.co.ke";
      if (req.user.email !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}-${req.file.originalname}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("mail-attachments")
        .upload(filename, req.file.buffer, {
          contentType: "application/pdf",
          cacheControl: "3600",
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("mail-attachments").getPublicUrl(filename);

      res.json({ success: true, url: publicUrl, path: data.path });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  }
);

export default router;
