import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Singleton browser instance to avoid repeated launches
let browserInstance = null;
let browserLaunchPromise = null;

/**
 * Get or create a reusable browser instance
 */
async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  // Prevent multiple simultaneous launches
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu",
    ],
    timeout: 30000,
  });

  try {
    browserInstance = await browserLaunchPromise;

    // Handle browser disconnection
    browserInstance.on("disconnected", () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });

    return browserInstance;
  } catch (error) {
    browserLaunchPromise = null;
    throw error;
  }
}

/**
 * Generate professional invoice PDF using Puppeteer
 */
export async function generateInvoicePDF(invoiceData) {
  const {
    invoiceNumber,
    clientName,
    lineItems,
    subtotal,
    kraTax,
    total,
    currency,
    paymentDetails,
    createdAt,
    userProfile,
  } = invoiceData;

  // Ensure output directory exists
  const outputDir = join(__dirname, "../../public/invoices");
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const filename = `${invoiceNumber}.pdf`;
  const filepath = join(outputDir, filename);

  // Create HTML template
  const html = generateInvoiceHTML(invoiceData);

  let page = null;
  let retries = 2;

  while (retries > 0) {
    try {
      const browser = await getBrowser();
      page = await browser.newPage();

      // Set a timeout for content loading
      await page.setContent(html, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      await page.pdf({
        path: filepath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "20mm",
          left: "15mm",
        },
        timeout: 15000,
      });

      console.log(`✅ Invoice PDF generated: ${filename}`);

      return {
        filename,
        filepath,
        url: `/invoices/${filename}`,
      };
    } catch (error) {
      retries--;
      console.error(
        `PDF generation attempt failed (${retries} retries left):`,
        error.message
      );

      // Close the browser and reset for retry
      if (browserInstance) {
        try {
          await browserInstance.close();
        } catch (e) {
          // Ignore close errors
        }
        browserInstance = null;
        browserLaunchPromise = null;
      }

      if (retries === 0) {
        throw error;
      }

      // Wait briefly before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore page close errors
        }
      }
    }
  }
}

/**
 * Generate HTML template for invoice
 */
function generateInvoiceHTML(data) {
  const {
    invoiceNumber,
    clientName,
    lineItems,
    subtotal,
    kraTax = 0,
    total,
    currency,
    paymentDetails,
    createdAt,
    userProfile = {},
  } = data;

  const currencySymbols = {
    KES: "KES",
    USD: "$",
    GBP: "£",
    EUR: "€",
  };

  const symbol = currencySymbols[currency] || currency;
  const formatAmount = (amount) =>
    `${symbol} ${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const invoiceDate = new Date(createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1a1a1a;
      line-height: 1.6;
      background: #ffffff;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 50px;
      padding-bottom: 30px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 800;
      color: #3b82f6;
      letter-spacing: -0.5px;
    }
    
    .invoice-details {
      text-align: right;
    }
    
    .invoice-number {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .invoice-date {
      font-size: 14px;
      color: #666;
    }
    
    .parties {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 50px;
    }
    
    .party-section h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #999;
      margin-bottom: 12px;
      font-weight: 600;
    }
    
    .party-info {
      font-size: 15px;
      line-height: 1.8;
    }
    
    .party-name {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 4px;
      color: #1a1a1a;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
    }
    
    .items-table thead {
      background: #f8f9fa;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .items-table th {
      padding: 16px 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #666;
    }
    
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    
    .items-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
    }
    
    .items-table td {
      padding: 20px 12px;
      font-size: 14px;
      color: #1a1a1a;
    }
    
    .item-description {
      font-weight: 500;
    }
    
    .summary {
      margin-left: auto;
      width: 350px;
      margin-bottom: 50px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 15px;
    }
    
    .summary-row.subtotal {
      border-top: 1px solid #e5e7eb;
    }
    
    .summary-row.tax {
      color: #666;
      font-size: 14px;
    }
    
    .summary-row.total {
      border-top: 2px solid #1a1a1a;
      margin-top: 8px;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
      color: #3b82f6;
    }
    
    .payment-section {
      background: #f8f9fa;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .payment-section h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .payment-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 14px;
    }
    
    .payment-label {
      color: #666;
      font-weight: 500;
    }
    
    .payment-value {
      color: #1a1a1a;
      font-weight: 600;
    }
    
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #999;
      font-size: 12px;
    }
    
    .footer-brand {
      color: #3b82f6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">VeriBridge</div>
        <div style="color: #666; font-size: 12px; margin-top: 4px;">
          Professional Invoice
        </div>
      </div>
      <div class="invoice-details">
        <div class="invoice-number">${invoiceNumber}</div>
        <div class="invoice-date">${invoiceDate}</div>
      </div>
    </div>
    
    <!-- Parties (From/To) -->
    <div class="parties">
      <div class="party-section">
        <h3>From</h3>
        <div class="party-info">
          <div class="party-name">${
            userProfile.name || "Your Business Name"
          }</div>
          <div>${userProfile.email || "email@example.com"}</div>
          <div>${userProfile.phone || "+254 XXX XXX XXX"}</div>
          ${
            userProfile.address
              ? `<div style="margin-top: 8px;">${userProfile.address}</div>`
              : ""
          }
        </div>
      </div>
      
      <div class="party-section">
        <h3>Bill To</h3>
        <div class="party-info">
          <div class="party-name">${clientName}</div>
        </div>
      </div>
    </div>
    
    <!-- Line Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="width: 80px;">Qty</th>
          <th style="width: 120px;">Rate</th>
          <th style="width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems
          .map(
            (item) => `
        <tr>
          <td class="item-description">${item.description}</td>
          <td>${item.quantity}</td>
          <td>${formatAmount(item.rate)}</td>
          <td>${formatAmount(item.amount)}</td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
    
    <!-- Summary -->
    <div class="summary">
      <div class="summary-row subtotal">
        <span>Subtotal</span>
        <span>${formatAmount(subtotal)}</span>
      </div>
      ${
        kraTax > 0
          ? `
      <div class="summary-row tax">
        <span>KRA Turnover Tax (1.5%)</span>
        <span>${formatAmount(kraTax)}</span>
      </div>
      `
          : ""
      }
      <div class="summary-row total">
        <span>Total</span>
        <span>${formatAmount(total)}</span>
      </div>
    </div>
    
    <!-- Payment Details -->
    ${
      paymentDetails
        ? `
    <div class="payment-section">
      <h3>Payment Details</h3>
      <div class="payment-details">
        ${
          paymentDetails.bankName
            ? `
        <div class="payment-label">Bank Name:</div>
        <div class="payment-value">${paymentDetails.bankName}</div>
        `
            : ""
        }
        ${
          paymentDetails.accountNumber
            ? `
        <div class="payment-label">Account Number:</div>
        <div class="payment-value">${paymentDetails.accountNumber}</div>
        `
            : ""
        }
        ${
          paymentDetails.iban
            ? `
        <div class="payment-label">IBAN:</div>
        <div class="payment-value">${paymentDetails.iban}</div>
        `
            : ""
        }
        ${
          paymentDetails.swift
            ? `
        <div class="payment-label">SWIFT/BIC:</div>
        <div class="payment-value">${paymentDetails.swift}</div>
        `
            : ""
        }
      </div>
    </div>
    `
        : ""
    }
    
    <!-- Footer -->
    <div class="footer">
      Generated by <span class="footer-brand">VeriBridge</span> • Professional Invoicing for Freelancers
    </div>
  </div>
</body>
</html>
  `;
}

export default { generateInvoicePDF };
