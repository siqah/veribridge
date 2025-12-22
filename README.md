# VeriBridge

> Global Address Verification Platform for Developers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

VeriBridge helps developers worldwide pass address verification for Google Play Console, Amazon, PayPal, Stripe, and 50+ platforms by providing professionally formatted addresses and verification documents.

## 🚀 Features

- **Address Architect** - Format addresses for 35+ countries with international compliance
- **Pre-Flight Verification** - 4-layer validation system (P.O. Box detection, document OCR, identity checks)
- **Verification Package** - Generate Certificate + Affidavit + Cover Letter with QR codes
- **MPESA Payments** - Integrated payment system for premium services
- **Upsell Services** - UK company formation, virtual mailbox, invoice generator, B2B API

## 📁 Project Structure

```
veribridge/
├── client/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # PDF generation, verification
│   │   ├── store/       # Zustand state management
│   │   └── services/    # API client
│   └── package.json
│
├── server/              # Express.js Backend
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── db/          # PostgreSQL schema
│   └── package.json
│
├── shared/              # Shared utilities
└── docker-compose.yml   # PostgreSQL + Redis
```

## 🛠️ Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install all dependencies (both client and server)
npm install

# Or install separately
cd client && npm install
cd server && npm install
```

### Development

```bash
# Run both frontend and backend
npm run dev

# Or run separately
npm run dev:client  # Frontend on http://localhost:5173
npm run dev:server  # Backend on http://localhost:3001
```

### Environment Variables

**Server** (`server/.env`):

```env
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001
CLIENT_URL=http://localhost:5173

# MPESA (optional - demo mode works without)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_ENV=sandbox
```

**Client** (`client/.env`) - Optional:

```env
VITE_API_URL=http://localhost:3001
```

## 🐳 Docker Setup

```bash
# Start PostgreSQL + Redis
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🌐 API Endpoints

### Verification

- `POST /api/verify/create` - Create verification record
- `GET /api/verify/:id` - Public verification lookup
- `GET /verify/:id` - Public verification page (HTML)

### Payments

- `POST /api/payments/stk-push` - Initiate MPESA payment
- `POST /api/payments/callback` - MPESA webhook
- `GET /api/payments/:id` - Check payment status

### Services

- `GET /api/services` - List all upsell services
- `POST /api/services/:id/interest` - Register service interest
- `POST /api/services/address-api/clean` - Clean address (B2B)

## 📦 Build

```bash
# Build frontend for production
npm run build

# Preview production build
cd client && npm run preview
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)

```bash
cd server
# Configure environment variables
# Deploy from server/ directory
```

## 🛡️ Services & Pricing

| Service               | Price (KES) | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| Basic Verification    | Free        | Address formatting + Affidavit template |
| Premium Verification  | 500         | QR code + Online verification           |
| UK Company Formation  | 5,000       | Stripe/PayPal access setup              |
| Virtual Mailbox       | 500/month   | Permanent business address              |
| Invoice Generator Pro | 200/month   | Professional invoices                   |

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/health

# Create verification
curl -X POST http://localhost:3001/api/verify/create \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","formattedAddress":"123 Main St, Nairobi, Kenya"}'

# List services
curl http://localhost:3001/api/services
```

## 📚 Tech Stack

**Frontend:**

- React 18
- Vite
- Zustand (state management)
- Tailwind CSS
- jsPDF (PDF generation)
- QRCode, Tesseract.js

**Backend:**

- Express.js
- PostgreSQL (planned)
- JWT authentication
- MPESA Daraja API
- QRCode generation

## 🤝 Contributing

This is a private project. For questions, contact the development team.

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- Documentation: See `PROJECT_SPECIFICATION.md`
- Issues: Contact development team
- Email: support@veribridge.co.ke

---

Built with ❤️ for developers worldwide
