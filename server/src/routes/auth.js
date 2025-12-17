import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const db = new Database(join(__dirname, "../../veribridge.db"));

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
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, phone)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      userId,
      email,
      passwordHash,
      fullName || null,
      phone || null
    );

    // Generate JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Update last login
    db.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).run(userId);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: userId,
        email,
        fullName: fullName || null,
        phone: phone || null,
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
    const user = db
      .prepare(
        `
      SELECT id, email, password_hash, full_name, phone 
      FROM users 
      WHERE email = ?
    `
      )
      .get(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Update last login
    db.prepare(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).run(user.id);

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
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
router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = db
      .prepare(
        `
      SELECT id, email, full_name, phone, created_at, email_verified
      FROM users
      WHERE id = ?
    `
      )
      .get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        createdAt: user.created_at,
        emailVerified: user.email_verified,
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
