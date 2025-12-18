# Environment Setup Guide

## Quick Start

1. **Copy environment template:**

   ```bash
   cd server
   cp .env.example .env
   ```

2. **Generate JWT Secret:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Copy the output and paste it as your `JWT_SECRET` in `.env`

3. **Configure SMTP (for emails):**

   **Option A: Gmail (Development)**

   - Enable 2FA: https://myaccount.google.com/security
   - Create App Password: https://myaccount.google.com/apppasswords
   - Update `.env` with your email and app password

   **Option B: SendGrid (Production)**

   - Sign up at https://sendgrid.com
   - Get API key from dashboard
   - Update SMTP settings in `.env`

4. **Update URLs:**
   - For development: `CLIENT_URL=http://localhost:5173`
   - For production: `CLIENT_URL=https://yourdomain.com`

## Required Environment Variables

### Critical (Must Configure)

- ✅ `JWT_SECRET` - Strong random string (32+ characters)
- ✅ `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - Email delivery
- ✅ `ADMIN_EMAIL` - Admin notifications
- ✅ `CLIENT_URL` - Frontend URL
- ✅ `PAYSTACK_SECRET_KEY` - Payment processing

### Optional

- `COMPANIES_HOUSE_API_KEY` - UK company name searches
- `OPENSANCTIONS_API_KEY` - KYC sanctions screening
- `MPESA_*` - Alternative payment method

## Token Expiry Settings

Current defaults (configurable in code):

- **JWT Token**: 7 days (`JWT_EXPIRES_IN`)
- **Email Verification**: 24 hours (hardcoded in `auth.js`)
- **Password Reset**: 1 hour (hardcoded in `auth.js`)

To change token expiry times, edit:

- `server/src/routes/auth.js` lines 66-67 (email verification)
- `server/src/routes/auth.js` lines 359-360 (password reset)

## Testing Email Delivery

After configuring SMTP, test with:

```bash
# Sign up for a new account
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Check your terminal/email for verification link
```

If SMTP is not configured, emails will be logged to the console.

## Production Deployment

Before deploying:

1. ✅ Set `NODE_ENV=production`
2. ✅ Use strong `JWT_SECRET` (run generation command)
3. ✅ Configure production SMTP (SendGrid recommended)
4. ✅ Update `CLIENT_URL` to production domain
5. ✅ Switch Paystack to live keys (`sk_live_...`)
6. ✅ Enable HTTPS only
7. ✅ Review and adjust token expiry times
8. ✅ Set up proper logging and monitoring

## Security Checklist

- [ ] JWT_SECRET is random and at least 32 characters
- [ ] SMTP credentials are from App Password, not main password
- [ ] CLIENT_URL matches your actual domain
- [ ] Paystack live keys are used in production
- [ ] `.env` file is in `.gitignore` (DO NOT commit!)
- [ ] HTTPS/TLS is enforced in production
- [ ] Token expiry times reviewed and appropriate
