import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../db/prisma.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        phoneNumber: phone || null,
        emailVerified: false,
        lastLogin: new Date(),
      },
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // Send verification email (don't block signup if email fails)
    try {
      await sendVerificationEmail(email, fullName, verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with signup even if email fails
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user.id,
        email,
        fullName: user.fullName,
        phone: user.phoneNumber,
        emailVerified: false,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phoneNumber,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * GET /api/auth/me
 * Get current user (requires auth)
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phoneNumber,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client should clear token)
 */
router.post("/logout", (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // Just send success response
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * POST /api/auth/request-verification
 * Resend email verification link
 */
router.post("/request-verification", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        fullName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Delete old verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await prisma.emailVerification.create({
      data: {
        userId,
        token: verificationToken,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.fullName, verificationToken);

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email with token
 */
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Find valid token
    const tokenRecord = await prisma.emailVerification.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Greater than now (not expired)
        },
      },
      select: {
        userId: true,
      },
    });

    if (!tokenRecord) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    // Update user email_verified status
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { emailVerified: true },
    });

    // Delete used token
    await prisma.emailVerification.deleteMany({
      where: { token },
    });

    console.log(`✅ Email verified for user: ${tokenRecord.userId}`);

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link",
      });
    }

    // Delete old reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
        used: false,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.fullName, resetToken);

    res.json({
      success: true,
      message:
        "If an account exists with this email, you will receive a password reset link",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Find valid, unused token
    const tokenRecord = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: {
          gt: new Date(), // Not expired
        },
        used: false,
      },
      select: {
        userId: true,
      },
    });

    if (!tokenRecord) {
      return res
        .status(400)
        .json({ error: "Invalid, expired, or already used reset token" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordReset.updateMany({
      where: { token },
      data: { used: true },
    });

    console.log(`✅ Password reset for user: ${tokenRecord.userId}`);

    res.json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

/**
 * Middleware: Authenticate JWT token
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user; // { userId, email }
    next();
  });
}

export default router;
