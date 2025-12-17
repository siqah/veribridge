# 📧 Email Notifications Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. **Go to**: https://myaccount.google.com/apppasswords

   - (You must have 2-factor authentication enabled first)

2. **Create App Password**:
   - App name: `VeriBridge`
   - Click "Generate"
   - Copy the 16-character code (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Server Environment

**Open**: `/server/.env`

**Add these lines** (replace with your details):

```bash
# Email Notifications (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
ADMIN_EMAIL=your-email@gmail.com
```

**Example**:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=faruoq@gmail.com
SMTP_PASS=xyzw abcd efgh ijkl
ADMIN_EMAIL=faruoq@gmail.com
```

### Step 3: Restart Server

The server auto-restarts when you save `.env`, or:

```bash
# Press Ctrl+C in terminal, then:
npm run dev
```

---

## Test Email Notifications

### Option A: Test Payment Flow

1. Go to http://localhost:5173
2. Business → Company Formation
3. Complete wizard
4. Pay with test card: `4084 0840 8408 4081`
5. **Check your email inbox!** 📬

### Option B: Manual Test (Quick)

Add this test endpoint to test emails without full payment:

**File**: `/server/src/routes/payments.js`

Add before `export default router;`:

```javascript
// Test endpoint - remove in production
router.get("/test-email", async (req, res) => {
  const { sendAdminAlert } = await import("../services/emailService.js");

  try {
    await sendAdminAlert({
      orderId: "TEST-123",
      companyName: "Test Company Ltd",
      jurisdiction: "UK",
      companyType: "LTD",
      directorName: "Test User",
      directorEmail: "test@example.com",
      directorPhone: "+254 700 123 456",
      directorAddress: "Test Address, Nairobi",
      amount: 20000,
    });
    res.json({ success: true, message: "Test email sent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: http://localhost:3001/api/payments/test-email

---

## What Emails Get Sent?

### When Payment Succeeds:

**Admin Alert** (to you):

```
Subject: 💰 New Company Formation Order - Tech Ltd

Company Name: Tech Ltd
Jurisdiction: UK LTD
Amount: KES 20,000
Director: John Doe

ACTION REQUIRED:
1. Log into 1st Formations
2. Submit formation
3. Update status to PROCESSING
```

**User Confirmation** (to customer):

```
Subject: Order Confirmation - Tech Ltd

Thank you for your order!
Order ID: ORD-7721
Status: Payment Received

We'll process your formation within 1-3 days.
```

---

## Troubleshooting

### ❌ "Less secure app access"

**Solution**: Use App Passwords (not your main Gmail password)

### ❌ "Invalid login"

**Solution**:

1. Enable 2-factor authentication first
2. Then create App Password
3. Copy password **without spaces**

### ❌ Still not working?

**Alternative SMTP Providers**:

**SendGrid** (Free 100 emails/day):

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun** (Free 5,000 emails/month):

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

---

## Production Recommendations

**For production use**, consider:

1. **SendGrid** (recommended for startups)

   - 100 emails/day free
   - Reliable delivery
   - Easy setup

2. **AWS SES**

   - $0.10 per 1,000 emails
   - Best for high volume

3. **Postmark**
   - 100 emails/month free
   - Excellent deliverability

---

## Security Notes

⚠️ **Never commit `.env` to git!** (already in `.gitignore`)

✅ **App passwords are safer** than your main password

✅ **Rotate passwords** regularly in production

---

**Ready!** Once configured, you'll get instant email alerts whenever someone pays! 📧✨
