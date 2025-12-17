import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  // Check if SMTP is configured
  const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_USER;

  if (!smtpConfigured) {
    console.warn('⚠️ SMTP not configured. Emails will be logged only.');
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
        <p><strong>Email:</strong> ${directorEmail || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${directorPhone || 'Not provided'}</p>
        <p><strong>Address:</strong><br/>${directorAddress || 'Not provided'}</p>
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
Email: ${directorEmail || 'Not provided'}
Phone: ${directorPhone || 'Not provided'}
Address: ${directorAddress || 'Not provided'}

ACTION REQUIRED:
────────────────
1. Log into 1st Formations wholesale portal
2. Submit company formation
3. Update order status to PROCESSING
4. Upload certificate when received

View Order: http://localhost:5173/admin-formations
  `;

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@veribadge.co.ke';

  if (!transporter) {
    // Log email content if SMTP not configured
    console.log('\n📧 ADMIN ALERT EMAIL (Not sent - SMTP not configured)');
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
    console.error('❌ Failed to send admin email:', error.message);
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
    console.log('\n📧 USER CONFIRMATION EMAIL (Not sent - SMTP not configured)');
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
    console.error('❌ Failed to send confirmation email:', error.message);
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
      message: 'We've submitted your formation to the registry. Expect your certificate within 1-3 business days.',
      color: '#2563eb',
    },
    COMPLETED: {
      subject: `🎉 Your company is registered! - ${companyName}`,
      message: 'Congratulations! Your company formation is complete. Download your certificate from the dashboard.',
      color: '#10b981',
    },
  };

  const statusInfo = statusMessages[status];
  if (!statusInfo || !transporter) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusInfo.color};">${statusInfo.subject}</h2>
      <p>${statusInfo.message}</p>
      <p><strong>Company Name:</strong> ${companyName}</p>
      ${status === 'COMPLETED' ? '<a href="http://localhost:5173" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Download Certificate</a>' : ''}
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
    console.error('❌ Failed to send status update:', error.message);
  }
}
