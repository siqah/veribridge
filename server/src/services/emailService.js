import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

// Email transporter configuration
const createTransporter = () => {
  // Check if SMTP is configured
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!smtpConfigured) {
    logger.warn("⚠️ SMTP not configured. Emails will be logged only.");
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
    logger.debug("\n📧 ADMIN ALERT EMAIL (Not sent - SMTP not configured)");
    logger.debug(`To: ${adminEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
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

    logger.success(`Admin alert email sent to ${adminEmail}`);
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

    logger.success(`Confirmation email sent to ${userEmail}`);
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

    logger.success(`Status update email sent to ${userEmail}`);
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
    logger.debug("\n📧 VERIFICATION EMAIL (Not sent - SMTP not configured)");
    logger.debug(`To: ${userEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
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

    logger.success(`Verification email sent to ${userEmail}`);
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
    logger.debug("\n📧 PASSWORD RESET EMAIL (Not sent - SMTP not configured)");
    logger.debug(`To: ${userEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
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

    logger.success(`Password reset email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error.message);
    throw error;
  }
}

/**
 * Send mail upload notification to user
 */
export async function sendMailNotification(userEmail, mailDetails) {
  const transporter = createTransporter();

  const { title, sender, receivedDate } = mailDetails;
  const subject = `New Mail Received - ${title}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">📬 You've Got Mail!</h2>
      
      <p>A new mail item has been uploaded to your digital mailbox.</p>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Sender:</strong> ${sender || "Unknown"}</p>
        <p><strong>Received:</strong> ${new Date(
          receivedDate || Date.now()
        ).toLocaleDateString()}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/mailbox" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Your Mailbox</a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        This is an automated notification from VeriBridge Digital Mailbox.
      </p>
    </div>
  `;

  const text = `
NEW MAIL RECEIVED

You've got a new mail item in your digital mailbox!

Title: ${title}
Sender: ${sender || "Unknown"}
Received: ${new Date(receivedDate || Date.now()).toLocaleDateString()}

View your mailbox: ${process.env.CLIENT_URL || "http://localhost:5173"}/mailbox
  `;

  if (!transporter) {
    logger.debug("\n📧 MAIL NOTIFICATION (Not sent - SMTP not configured)");
    logger.debug(`To: ${userEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge Mailbox" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject,
      text,
      html,
    });

    logger.success(`Mail notification sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send mail notification:", error.message);
    throw error;
  }
}

/**
 * Send formation completion notification to user
 */
export async function sendFormationCompletionEmail(orderDetails) {
  const transporter = createTransporter();

  const { companyName, registrationNumber, certificateUrl, directorEmail } =
    orderDetails;
  const subject = `🎉 Your Company is Registered! - ${companyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">🎉 Congratulations!</h2>
      
      <p>Your company formation is complete. Your business is now officially registered!</p>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>Registration Number:</strong> <span style="color: #2563eb; font-weight: bold;">${registrationNumber}</span></p>
        <p><strong>Status:</strong> <span style="color: #10b981;">✅ Registered</span></p>
      </div>

      <h3>Next Steps:</h3>
      <ol style="line-height: 1.8;">
        <li>Download your incorporation certificate from the dashboard</li>
        <li>Set up your business bank account</li>
        <li>Register for VAT if applicable</li>
        <li>Open merchant accounts (Stripe, PayPal, etc.)</li>
      </ol>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/my-orders" style="display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Download Certificate</a>
      </div>

      ${
        certificateUrl
          ? `
        <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>📄 Direct Download:</strong><br/>
            <a href="${certificateUrl}" style="color: #2563eb;">${certificateUrl}</a>
          </p>
        </div>
      `
          : ""
      }

      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Need help? Contact support@veribridge.co.ke
      </p>
    </div>
  `;

  const text = `
🎉 CONGRATULATIONS! YOUR COMPANY IS REGISTERED!

Your company formation is complete!

Company Name: ${companyName}
Registration Number: ${registrationNumber}
Status: ✅ Registered

NEXT STEPS:
1. Download your incorporation certificate
2. Set up your business bank account
3. Register for VAT if applicable
4. Open merchant accounts

View your certificate: ${
    process.env.CLIENT_URL || "http://localhost:5173"
  }/my-orders

${certificateUrl ? `Direct download: ${certificateUrl}` : ""}

Need help? Email support@veribridge.co.ke
  `;

  if (!transporter) {
    logger.debug(
      "\n📧 FORMATION COMPLETION EMAIL (Not sent - SMTP not configured)"
    );
    logger.debug(`To: ${directorEmail}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug(text);
    return { success: true, demo: true };
  }

  try {
    await transporter.sendMail({
      from: `"VeriBridge" <${process.env.SMTP_USER}>`,
      to: directorEmail,
      subject,
      text,
      html,
    });

    logger.success(`Formation completion email sent to ${directorEmail}`);
    return { success: true };
  } catch (error) {
    console.error(
      "❌ Failed to send formation completion email:",
      error.message
    );
    throw error;
  }
}
