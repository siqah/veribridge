# VeriBridge Client (Frontend)

React + Vite application for global address verification.

## Features

- **Address Architect** - Format addresses for 35+ countries
- **Pre-Flight Verification** - 4-layer validation system
- **Verification Package** - Generate Certificate + Affidavit + Cover Letter
- **QR Codes** - Unique verification IDs with scannable codes
- **Bank Tools** - Mobile banking guides & teller instructions
- **OCR Validator** - Scan documents before submission

## Tech Stack

- React 18
- Vite
- Zustand (state management)
- Tailwind CSS
- jsPDF (document generation)
- QRCode (QR code generation)
- Tesseract.js (OCR)
- Lucide React (icons)

## Development

```bash
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

## Environment Variables

Create `.env` if needed:

```
VITE_API_URL=http://localhost:3001
```

## Build

```bash
npm run build
```

## Deploy

Optimized for Vercel/Netlify deployment.
