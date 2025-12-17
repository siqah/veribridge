// Load environment variables FIRST (before any other imports)
import "./env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Routes
import verificationRoutes from "./routes/verification.js";
import paymentsRoutes from "./routes/payments.js";
import servicesRoutes from "./routes/services.js";
import authRoutes from "./routes/auth.js";
// Freelancer OS Routes
import companyOrdersRoutes from "./routes/companyOrders.js";
import formationRoutes from "./routes/formation.js"; // New formation engine
import invoicesRoutes from "./routes/invoices.js";
import mailboxRoutes from "./routes/mailbox.js";
import apiKeysRoutes from "./routes/apiKeys.js";
import addressApiRoutes from "./routes/addressApi.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (PDFs, images, etc.)
app.use(express.static("public"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "VeriBridge API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/verify", verificationRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/auth", authRoutes);

// Freelancer OS API Routes
app.use("/api/company-orders", companyOrdersRoutes); // Legacy
app.use("/api/formation", formationRoutes); // New formation engine
app.use("/api/invoices", invoicesRoutes);
app.use("/api/mailbox", mailboxRoutes);
app.use("/api/keys", apiKeysRoutes);
app.use("/api/v1", addressApiRoutes); // B2B API

// Public verification page (for QR codes)
app.get("/verify/:id", async (req, res) => {
  const { id } = req.params;

  // In production, fetch from database
  // For now, return a simple HTML page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VeriBridge - Verification ${id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .logo { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1e40af;
          margin-bottom: 24px;
        }
        .logo span { color: #3b82f6; }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #dcfce7;
          color: #166534;
          padding: 8px 16px;
          border-radius: 9999px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .id {
          font-family: monospace;
          background: #f1f5f9;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 24px;
        }
        .info { color: #64748b; line-height: 1.6; }
        .footer { 
          margin-top: 24px; 
          padding-top: 24px; 
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">Veri<span>Bridge</span></div>
        <div class="status">✓ VERIFIED</div>
        <div class="id">${id}</div>
        <p class="info">
          This verification ID was issued by VeriBridge Verification Services.
          The document holder's identity and address have been verified.
        </p>
        <div class="footer">
          VeriBridge - Global Address Verification<br>
          www.veribridge.co.ke
        </div>
      </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║     VeriBridge API Server                     ║
  ║     Running on http://localhost:${PORT}          ║
  ╚═══════════════════════════════════════════════╝
  `);
});

export default app;
