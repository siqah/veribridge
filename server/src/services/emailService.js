import nodemailer from "nodemailer";

// Email transporter configuration
const createTransporter = () => {
  // Check if SMTP is configured
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!smtpConfigured) {
    console.warn("⚠️ SMTP not configured. Emails will be logged only.");
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send admin alert email when new paid order is received
 */
export async function sendAdminAlert(orderDetails) {
  const transporter = createTransporter();

  const {
    orderId,
    companyName,
    jurisdiction,
    companyType,
    directorName,
    directorEmail,
    directorPhone,
    directorAddress,
    amount,
  } = orderDetails;

  const subject = `💰 New Company Formation Order - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">NEW ${jurisdiction} COMPANY ORDER RECEIVED</h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>Jurisdiction:</strong> ${jurisdiction} ${companyType}</p>
        <p><strong>Amount Paid:</strong> <span style="color: #10b981;">KES ${amount.toLocaleString()}</span></p>
      </div>

      <h3>DIRECTOR DETAILS</h3>
      <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6;">
        <p><strong>Name:</strong> ${directorName}</p>
        <p><strong>Email:</strong> ${directorEmail || "Not provided"}</p>
        <p><strong>Phone:</strong> ${directorPhone || "Not provided"}</p>
        <p><strong>Address:</strong><br/>${
          directorAddress || "Not provided"
        }</p>
      </div>

      <h3 style="color: #dc2626;">ACTION REQUIRED</h3>
      <ol style="line-height: 1.8;">
        <li>Log into <strong>1st Formations</strong> wholesale portal</li>
        <li>Submit company formation with above details</li>
        <li>Update order status to <strong>PROCESSING</strong> in admin panel</li>
        <li>Upload certificate when received from partner</li>
      </ol>

      <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0;"><strong>⚡ Quick Link:</strong></p>
        <a href="http://localhost:5173/admin-formations" style="color: #2563eb; text-decoration: none;">View Order in Admin Panel →</a>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        This is an automated notification from VeriBridge. Do not reply to this email.
      </p>
    </div>
  `;

  const text = `
NEW ${jurisdiction} COMPANY ORDER RECEIVED
═══════════════════════════════════════

Order ID: ${orderId}
Company Name: ${companyName}
Jurisdiction: ${jurisdiction} ${companyType}
Amount Paid: KES ${amount.toLocaleString()}

DIRECTOR DETAILS:
────────────────
Name: ${directorName}
Email: ${directorEmail || "Not provided"}
Phone: ${directorPhone || "Not provided"}
Address: ${directorAddress || "Not provided"}

ACTION REQUIRED:
────────────────
1. Log into 1st Formations wholesale portal
2. Submit company formation
3. Update order status to PROCESSING
4. Upload certificate when received

View Order: http://localhost:5173/admin-formations
  `;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@veribadge.co.ke";

  if (!transporter) {
    // Log email content if SMTP not configured
    console.log("\n📧 ADMIN ALERT EMAIL (Not sent - SMTP not configured)");
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge Notifications" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject,
      text,
      html,
    });

    console.log(`✅ Admin alert email sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send admin email:", error.message);
    throw error;
  }
}

/**
 * Send order confirmation to user
 */
export async function sendOrderConfirmation(userEmail, orderId, companyName) {
  const transporter = createTransporter();

  const subject = `Order Confirmation - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">✅ Order Confirmed!</h2>
      
      <p>Thank you for your order. We've received your payment and are now processing your company formation.</p>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>Status:</strong> <span style="color: #2563eb;">Payment Received</span></p>
      </div>

      <h3>What happens next?</h3>
      <ol style="line-height: 1.8;">
        <li>Our team will submit your formation to the registry</li>
        <li>Processing typically takes 1-3 business days</li>
        <li>You'll receive an email when your certificate is ready</li>
        <li>Download your incorporation certificate from your dashboard</li>
      </ol>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Need help? Reply to this email or contact support@veribadge.co.ke
      </p>
    </div>
  `;

  const text = `
✅ ORDER CONFIRMED!

Thank you for your order. We've received your payment.

Order ID: ${orderId}
Company Name: ${companyName}
Status: Payment Received

NEXT STEPS:
1. We'll submit your formation to the registry
2. Processing takes 1-3 business days
3. You'll get an email when your certificate is ready
4. Download from your dashboard

Need help? Email support@veribadge.co.ke
  `;

  if (!transporter) {
    console.log(
      "\n📧 USER CONFIRMATION EMAIL (Not sent - SMTP not configured)"
    );
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      text,
      html,
    });

    console.log(`✅ Confirmation email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error.message);
    throw error;
  }
}

/**
 * Send status update notification
 */
export async function sendStatusUpdate(userEmail, status, companyName) {
  const transporter = createTransporter();

  const statusMessages = {
    PROCESSING: {
      subject: `Your company formation is being processed - ${companyName}`,
      message:
        "We've submitted your formation to the registry. Expect your certificate within 1-3 business days.",
      color: "#2563eb",
    },
    COMPLETED: {
      subject: `🎉 Your company is registered! - ${companyName}`,
      message:
        "Congratulations! Your company formation is complete. Download your certificate from the dashboard.",
      color: "#10b981",
    },
  };

  const statusInfo = statusMessages[status];
  if (!statusInfo || !transporter) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusInfo.color};">${statusInfo.subject}</h2>
      <p>${statusInfo.message}</p>
      <p><strong>Company Name:</strong> ${companyName}</p>
      ${
        status === "COMPLETED"
          ? '<a href="http://localhost:5173" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Download Certificate</a>'
          : ""
      }
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"VeriBridge" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: statusInfo.subject,
      html,
    });

    console.log(`✅ Status update email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Failed to send status update:", error.message);
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(
  userEmail,
  fullName,
  verificationToken
) {
  const transporter = createTransporter();

  const verificationUrl = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/verify-email?token=${verificationToken}`;

  const subject = "Welcome to VeriBridge - Verify Your Email";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to VeriBridge! 🎉</h2>
      
      <p>Hi ${fullName || "there"},</p>
      
      <p>Thank you for signing up for VeriBridge. To get started, please verify your email address by clicking the button below:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Or copy and paste this link into your browser:<br/>
        <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
      </p>

      <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px;">
          <strong>⏰ This link expires in 24 hours</strong>
        </p>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `;

  const text = `
Welcome to VeriBridge!

Hi ${fullName || "there"},

Thank you for signing up. Please verify your email address by clicking the link below:

${verificationUrl}

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.
  `;

  if (!transporter) {
    console.log("\n📧 VERIFICATION EMAIL (Not sent - SMTP not configured)");
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      text,
      html,
    });

    console.log(`✅ Verification email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userEmail, fullName, resetToken) {
  const transporter = createTransporter();

  const resetUrl = `${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/reset-password?token=${resetToken}`;

  const subject = "Reset Your VeriBridge Password";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      
      <p>Hi ${fullName || "there"},</p>
      
      <p>We received a request to reset your password for your VeriBridge account. Click the button below to create a new password:</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
      </p>

      <div style="margin-top: 30px; padding: 15px; background: #fee2e2; border-left: 4px solid #dc2626; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          <strong>⚠️ Security Notice</strong><br/>
          This link expires in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        For security reasons, we never send passwords via email.
      </p>
    </div>
  `;

  const text = `
Password Reset Request

Hi ${fullName || "there"},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
  `;

  if (!transporter) {
    console.log("\n📧 PASSWORD RESET EMAIL (Not sent - SMTP not configured)");
    console.log(`To: ${userEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      text,
      html,
    });

    console.log(`✅ Password reset email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
    throw error;
  }
}

/**
 * Send payment reminder email for invoice
 */
export async function sendPaymentReminderEmail(reminderData) {
  const transporter = createTransporter();

  const {
    to,
    invoiceNumber,
    clientName,
    amount,
    currency,
    dueDate,
    portalLink,
    reminderType,
    businessName,
  } = reminderData;

  // Get urgency based on reminder type
  const urgencyConfig = {
    before_due: { color: "#3b82f6", emoji: "📅", urgency: "" },
    on_due: { color: "#f59e0b", emoji: "⏰", urgency: "Payment Due Today" },
    overdue_7: { color: "#ef4444", emoji: "⚠️", urgency: "7 Days Overdue" },
    overdue_14: {
      color: "#dc2626",
      emoji: "🚨",
      urgency: "URGENT: 14 Days Overdue",
    },
  };

  const config = urgencyConfig[reminderType] || urgencyConfig.before_due;
  const formattedAmount = `${currency} ${Number(amount).toLocaleString()}`;
  const formattedDueDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

  const subject = config.urgency
    ? `${config.emoji} ${config.urgency}: Invoice ${invoiceNumber}`
    : `📅 Payment Reminder: Invoice ${invoiceNumber}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: ${config.color}; margin-top: 0;">${config.emoji} Payment Reminder</h2>
        
        <p>Dear ${clientName},</p>
        
        <p>This is a reminder about your outstanding invoice from <strong>${businessName}</strong>.</p>
        
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
          <p style="margin: 0 0 10px 0;"><strong>Amount Due:</strong> <span style="color: ${config.color}; font-size: 1.2em; font-weight: bold;">${formattedAmount}</span></p>
          <p style="margin: 0;"><strong>Due Date:</strong> ${formattedDueDate}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalLink}" style="display: inline-block; background: ${config.color}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View &amp; Pay Invoice
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px;">
          If you have already made this payment, please disregard this email. 
          For any questions, please contact us.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          This email was sent by ${businessName} via VeriBridge.
        </p>
      </div>
    </div>
  `;

  const text = `
Payment Reminder - Invoice ${invoiceNumber}

Dear ${clientName},

This is a reminder about your outstanding invoice from ${businessName}.

Invoice: ${invoiceNumber}
Amount Due: ${formattedAmount}
Due Date: ${formattedDueDate}

View and pay your invoice here:
${portalLink}

If you have already made this payment, please disregard this email.

Thank you,
${businessName}
  `;

  if (!transporter) {
    console.log("\n📧 PAYMENT REMINDER EMAIL (Not sent - SMTP not configured)");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"${businessName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Payment reminder sent for ${invoiceNumber} to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send payment reminder:", error.message);
    throw error;
  }
}
