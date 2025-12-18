# VeriBridge - Complete URL Routes

## 🔐 Authentication Pages

Direct URLs accessible even when logged out:

- **`/login`** - Login page (compact, glassmorphism design)
- **`/signup`** - Create new account
- **`/verify-email`** - Email verification (auto-redirected from email)
- **`/forgot-password`** - Request password reset
- **`/reset-password`** - Set new password (auto-redirected from email)

---

## 🏠 Main Pages

- **`/`** - Home page (main dashboard)

---

## ✅ Verification Tools

Tools for KYC address formatting and document generation:

- **`/address-builder`** - Address Architect - Format your Kenyan address
- **`/verification-package`** - Complete verification package (certificate + affidavit)
- **`/bank-guides`** - Quick Update - Mobile banking guides
- **`/bank-card`** - Bank Instructions - Printable teller card
- **`/affidavit`** - Affidavit Only - Sworn declaration generator
- **`/ocr-validator`** - Validate Document - OCR scanning tool

---

## 💼 Business Services

Enterprise features for businesses:

- **`/my-orders`** - My Orders - Track company formations
- **`/company-formation`** - Company Formation - Register UK Ltd / US LLC
- **`/invoicing`** - Invoicing - KRA-compliant invoice generator
- **`/mailbox`** - Digital Mailbox - Virtual address service
- **`/mailbox/subscribe`** - Subscribe to Mailbox - Get virtual address
- **`/api-keys`** - API Keys - Developer API access

---

## 👨‍💼 Admin Panel

- **`/admin/formations`** - Formation Orders - Manage company formations (admin only)

---

## 📄 Legal Pages

- **`/terms`** - Terms of Service
- **`/privacy`** - Privacy Policy

---

## 🎯 Quick Navigation Examples

**For Users:**

```
http://localhost:5173/address-builder         # Build your address
http://localhost:5173/verification-package     # Get full verification
http://localhost:5173/company-formation        # Register a company
http://localhost:5173/invoicing                # Create invoices
```

**For Auth:**

```
http://localhost:5173/login                    # Login
http://localhost:5173/signup                   # Sign up
```

**For Admin:**

```
http://localhost:5173/admin/formations         # Manage formations
```

---

## ✨ Features

- ✅ All routes bookmarkable
- ✅ Browser back/forward works
- ✅ Direct URL access
- ✅ Active route highlighting in navigation
- ✅ Breadcrumbs on all pages
- ✅ Mobile-responsive sidebar
- ✅ Auth pages are fullscreen (no layout wrapper)
- ✅ App pages have full layout (header + sidebar)

---

## 🔄 Route Behavior

**Auth Routes** (`/login`, `/signup`, etc.)

- Render fullscreen without app layout
- Redirect to `/` after successful login

**App Routes** (all others)

- Render with full layout (header, sidebar, footer)
- Show breadcrumb navigation
- Highlight active route in sidebar

**404 Handling**

- Any unknown route redirects to `/` (home page)

---

## 🚀 Production Deployment

When deploying, ensure your server/hosting supports client-side routing:

**Vercel/Netlify** - Works out of the box

**Other Hosts** - Add rewrite rule:

```
/*  /index.html  200
```

Or configure your server to serve `index.html` for all routes.
