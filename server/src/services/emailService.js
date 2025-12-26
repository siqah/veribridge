import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@veribridge.co.ke";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

/**
 * Create email transporter
 */
const createTransporter = () => {
  // Check if SMTP is configured
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!smtpConfigured) {
    logger.warn("⚠️ SMTP not configured. Emails will be logged only.");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// ... [All existing email functions remain the same] ...

/**
 * Send invoice email to client
 */
export async function sendInvoiceEmail(
  invoice,
  recipientEmail,
  businessProfile
) {
  const transporter = createTransporter();

  const subject = `Invoice ${invoice.invoiceNumber} from ${
    businessProfile?.businessName || "Your Business"
  }`;

  const formatCurrency = (amount, currency) => {
    return `${currency} ${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td>
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">INVOICE</h1>
                        <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 16px;">#${
                          invoice.invoiceNumber
                        }</p>
                      </td>
                      ${
                        businessProfile?.businessLogo
                          ? `
                      <td align="right">
                        <img src="${businessProfile.businessLogo}" alt="Logo" style="max-height: 60px; max-width: 150px;">
                      </td>
                      `
                          : ""
                      }
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Business Details -->
              <tr>
                <td style="padding: 30px 40px;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="vertical-align: top; width: 50%;">
                        <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">From</h3>
                        <p style="margin: 0; color: #334155; font-size: 16px; font-weight: 600;">${
                          businessProfile?.businessName || "Business Name"
                        }</p>
                        ${
                          businessProfile?.businessEmail
                            ? `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${businessProfile.businessEmail}</p>`
                            : ""
                        }
                        ${
                          businessProfile?.businessPhone
                            ? `<p style="margin: 2px 0 0 0; color: #64748b; font-size: 14px;">${businessProfile.businessPhone}</p>`
                            : ""
                        }
                        ${
                          businessProfile?.businessAddress
                            ? `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">${businessProfile.businessAddress.replace(
                                /\n/g,
                                "<br>"
                              )}</p>`
                            : ""
                        }
                        ${
                          businessProfile?.taxId
                            ? `<p style="margin: 10px 0 0 0; color: #64748b; font-size: 13px;">Tax ID: ${businessProfile.taxId}</p>`
                            : ""
                        }
                      </td>
                      <td style="vertical-align: top; width: 50%;" align="right">
                        <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bill To</h3>
                        <p style="margin: 0; color: #334155; font-size: 16px; font-weight: 600;">${
                          invoice.clientName
                        }</p>
                        ${
                          invoice.clientEmail
                            ? `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">${invoice.clientEmail}</p>`
                            : ""
                        }
                        ${
                          invoice.clientAddress
                            ? `<p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">${invoice.clientAddress.replace(
                                /\n/g,
                                "<br>"
                              )}</p>`
                            : ""
                        }
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Invoice Meta -->
              <tr>
                <td style="padding: 0 40px 20px 40px;">
                  <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 6px; padding: 15px;">
                    <tr>
                      <td style="padding: 5px;">
                        <span style="color: #64748b; font-size: 13px;">Issue Date:</span>
                        <strong style="color: #1e293b; font-size: 14px; margin-left: 10px;">${new Date(
                          invoice.createdAt
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}</strong>
                      </td>
                      ${
                        invoice.dueDate
                          ? `
                      <td align="right" style="padding: 5px;">
                        <span style="color: #64748b; font-size: 13px;">Due Date:</span>
                        <strong style="color: #dc2626; font-size: 14px; margin-left: 10px;">${new Date(
                          invoice.dueDate
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}</strong>
                      </td>
                      `
                          : ""
                      }
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Line Items -->
              <tr>
                <td style="padding: 0 40px 20px 40px;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: #f1f5f9;">
                        <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</th>
                        <th style="padding: 12px; text-align: center; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                        <th style="padding: 12px; text-align: right; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Rate</th>
                        <th style="padding: 12px; text-align: right; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoice.lineItems
                        .map(
                          (item, index) => `
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                          <td style="padding: 12px; color: #334155; font-size: 14px;">${
                            item.description
                          }</td>
                          <td style="padding: 12px; text-align: center; color: #64748b; font-size: 14px;">${
                            item.quantity
                          }</td>
                          <td style="padding: 12px; text-align: right; color: #64748b; font-size: 14px;">${formatCurrency(
                            item.rate,
                            invoice.currency
                          )}</td>
                          <td style="padding: 12px; text-align: right; color: #1e293b; font-size: 14px; font-weight: 600;">${formatCurrency(
                            item.amount,
                            invoice.currency
                          )}</td>
                        </tr>
                      `
                        )
                        .join("")}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals -->
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="width: 60%;"></td>
                      <td style="width: 40%;">
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Subtotal:</td>
                            <td align="right" style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${formatCurrency(
                              invoice.subtotal,
                              invoice.currency
                            )}</td>
                          </tr>
                          ${
                            invoice.kraTax > 0
                              ? `
                          <tr>
                            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">KRA Tax (1.5%):</td>
                            <td align="right" style="padding: 8px 0; color: #f59e0b; font-size: 14px; font-weight: 600;">${formatCurrency(
                              invoice.kraTax,
                              invoice.currency
                            )}</td>
                          </tr>
                          `
                              : ""
                          }
                          <tr style="border-top: 2px solid #e2e8f0;">
                            <td style="padding: 12px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 700;">TOTAL:</td>
                            <td align="right" style="padding: 12px 0 0 0; color: #7c3aed; font-size: 20px; font-weight: 700;">${formatCurrency(
                              invoice.total,
                              invoice.currency
                            )}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Payment Details -->
              ${
                invoice.bankName || invoice.accountNumber
                  ? `
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                    <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Payment Details</h3>
                    ${
                      invoice.bankName
                        ? `<p style="margin: 5px 0; color: #0369a1; font-size: 14px;"><strong>Bank:</strong> ${invoice.bankName}</p>`
                        : ""
                    }
                    ${
                      invoice.accountNumber
                        ? `<p style="margin: 5px 0; color: #0369a1; font-size: 14px;"><strong>Account:</strong> ${invoice.accountNumber}</p>`
                        : ""
                    }
                    ${
                      invoice.iban
                        ? `<p style="margin: 5px 0; color: #0369a1; font-size: 14px;"><strong>IBAN:</strong> ${invoice.iban}</p>`
                        : ""
                    }
                    ${
                      invoice.swift
                        ? `<p style="margin: 5px 0; color: #0369a1; font-size: 14px;"><strong>SWIFT/BIC:</strong> ${invoice.swift}</p>`
                        : ""
                    }
                  </div>
                </td>
              </tr>
              `
                  : ""
              }

              <!-- Notes -->
              ${
                invoice.notes
                  ? `
              <tr>
                <td style="padding: 0 40px 30px 40px;">
                  <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #fbbf24;">
                    <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 13px; font-weight: 700; text-transform: uppercase;">Notes</h3>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">${invoice.notes.replace(
                      /\n/g,
                      "<br>"
                    )}</p>
                  </div>
                </td>
              </tr>
              `
                  : ""
              }

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f8fafc; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #64748b; font-size: 13px;">
                    Thank you for your business!
                  </p>
                  <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">
                    This invoice was generated by VeriBridge on ${new Date().toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}<br>
                    Questions? Contact ${
                      businessProfile?.businessEmail || "your business"
                    }
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
INVOICE ${invoice.invoiceNumber}
${"=".repeat(60)}

FROM: ${businessProfile?.businessName || "Business Name"}
${businessProfile?.businessEmail || ""}
${businessProfile?.businessAddress || ""}

TO: ${invoice.clientName}
${invoice.clientEmail || ""}
${invoice.clientAddress || ""}

ISSUE DATE: ${new Date(invoice.createdAt).toLocaleDateString()}
${
  invoice.dueDate
    ? `DUE DATE: ${new Date(invoice.dueDate).toLocaleDateString()}`
    : ""
}

${"─".repeat(60)}

ITEMS:
${invoice.lineItems
  .map(
    (item, i) => `
${i + 1}. ${item.description}
   ${item.quantity} × ${formatCurrency(
      item.rate,
      invoice.currency
    )} = ${formatCurrency(item.amount, invoice.currency)}
`
  )
  .join("")}

${"─".repeat(60)}

SUBTOTAL: ${formatCurrency(invoice.subtotal, invoice.currency)}
${
  invoice.kraTax > 0
    ? `KRA TAX (1.5%): ${formatCurrency(invoice.kraTax, invoice.currency)}`
    : ""
}

TOTAL: ${formatCurrency(invoice.total, invoice.currency)}

${"=".repeat(60)}

${
  invoice.bankName || invoice.accountNumber
    ? `
PAYMENT DETAILS:
${invoice.bankName ? `Bank: ${invoice.bankName}` : ""}
${invoice.accountNumber ? `Account: ${invoice.accountNumber}` : ""}
${invoice.iban ? `IBAN: ${invoice.iban}` : ""}
${invoice.swift ? `SWIFT/BIC: ${invoice.swift}` : ""}
`
    : ""
}

${
  invoice.notes
    ? `
NOTES:
${invoice.notes}
`
    : ""
}

Thank you for your business!

Generated by VeriBridge
  `;

  if (!transporter) {
    logger.debug("\n📧 INVOICE EMAIL (Not sent - SMTP not configured)");
    logger.debug(`To: ${recipientEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"${businessProfile?.businessName || "VeriBridge"}" <${
        process.env.SMTP_USER
      }>`,
      to: recipientEmail,
      subject,
      text,
      html,
      // TODO: Attach PDF if pdfUrl is provided
    });

    logger.success(`Invoice email sent to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send invoice email:", error.message);
    throw error;
  }
}

export default {
  sendAdminAlert,
  sendOrderConfirmation,
  sendStatusUpdate,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMailNotification,
  sendFormationCompletionEmail,
  sendInvoiceEmail,
};
