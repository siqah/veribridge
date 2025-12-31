import express from "express";
import multer from "multer";
import prisma from "../db/prisma.js";
import { authenticateToken } from "./auth.js";
import { uploadToSupabase } from "../config/supabase.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, and WebP images are allowed."
        )
      );
    }
  },
});

/**
 * GET /api/profile
 * Get or create user's profile
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Try to get existing profile
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    // If no profile exists, create one with defaults
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          businessName: req.user.fullName || "My Business",
          businessEmail: req.user.email,
          defaultCurrency: "KES",
          invoicePrefix: "INV",
        },
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: error.message,
    });
  }
});

/**
 * PUT /api/profile
 * Update user's profile
 */
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      businessName,
      businessEmail,
      businessPhone,
      businessAddress,
      taxId,
      companyNumber,
      defaultCurrency,
      invoicePrefix,
    } = req.body;

    // Validation
    if (!businessName || businessName.trim().length === 0) {
      return res.status(400).json({
        error: "Business name is required",
      });
    }

    // Update or create profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        taxId,
        companyNumber,
        defaultCurrency,
        invoicePrefix,
      },
      create: {
        userId,
        businessName,
        businessEmail,
        businessPhone,
        businessAddress,
        taxId,
        companyNumber,
        defaultCurrency: defaultCurrency || "KES",
        invoicePrefix: invoicePrefix || "INV",
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
});

/**
 * POST /api/profile/logo
 * Upload business logo
 */
router.post(
  "/logo",
  authenticateToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      const userId = req.user.userId;

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          error: "No logo file provided",
        });
      }

      const logoFile = req.file;

      // Upload to Supabase Storage
      const fileName = `logos/${userId}-${Date.now()}.${logoFile.originalname
        .split(".")
        .pop()}`;
      const uploadResult = await uploadToSupabase(
        logoFile.buffer,
        fileName,
        logoFile.mimetype,
        "logos"
      );

      if (!uploadResult.success) {
        return res.status(500).json({
          error: "Failed to upload logo",
          details: uploadResult.error,
        });
      }

      // Update profile with logo URL
      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          businessLogo: uploadResult.url,
        },
        create: {
          userId,
          businessName: req.user.fullName || "My Business",
          businessEmail: req.user.email,
          businessLogo: uploadResult.url,
          defaultCurrency: "KES",
          invoicePrefix: "INV",
        },
      });

      res.json({
        success: true,
        message: "Logo uploaded successfully",
        logoUrl: uploadResult.url,
        profile,
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      res.status(500).json({
        error: "Failed to upload logo",
        details: error.message,
      });
    }
  }
);

/**
 * DELETE /api/profile/logo
 * Remove business logo
 */
router.delete("/logo", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Update profile to remove logo
    const profile = await prisma.userProfile.update({
      where: { userId },
      data: {
        businessLogo: null,
      },
    });

    res.json({
      success: true,
      message: "Logo removed successfully",
      profile,
    });
  } catch (error) {
    console.error("Error removing logo:", error);
    res.status(500).json({
      error: "Failed to remove logo",
      details: error.message,
    });
  }
});

export default router;
