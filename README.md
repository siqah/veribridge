# VeriBridge

> **Address Verification for Developers in the Global South**

VeriBridge helps freelance developers in Kenya (and expanding to other Global South countries) format their addresses correctly for international platforms like Google Play Console, Amazon, and other global services that reject P.O. Box addresses and colloquial location descriptions.

## 🎯 Problem Statement

Developers get banned from global platforms because:

- National IDs show only District/Location (no physical addresses)
- Bank statements default to "P.O. Box" addresses
- Global AI models reject non-residential addresses
- Informal address descriptions ("Near Naivas", "Opposite KFC") are not accepted

VeriBridge bridges this compliance gap.

## ✨ Features

### Module 1: Address Architect

- 🗺️ **OpenStreetMap Integration** (No API key required!)
- 🔍 Real-time address search with autocomplete dropdown
- ✍️ Manual address input with smart formatting
- 🧹 Automatic removal of colloquialisms ("Near", "Opposite", etc.)
- ✅ Real-time validation with color-coded feedback
- 📋 Structured output: `[Building], [Street], [Area], [City], [Postal Code]`

### Module 2: Bank Instruction Generator

- 🏦 Support for major Kenyan banks (Equity, KCB, Co-op, NCBA)
- 📄 Professional PDF generation with jsPDF
- 📝 Clear instructions for bank tellers
- ⚠️ Warning labels about P.O. Box usage
- 💼 Enterprise-grade document design

### Module 3: Pre-Flight Validator (Coming Soon)

- 📸 Bank statement upload and OCR scanning
- 🔍 P.O. Box detection in documents
- ✓ Compliance verification before submission

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- **No API keys required!** OpenStreetMap is free and open source

### Installation

```bash
# Clone or navigate to the project directory
cd veribridge

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand
- **PDF**: jsPDF
- **Maps**: OpenStreetMap Nominatim API (free, no API key required)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── AddressBuilder.jsx          # Module 1: Address input & formatting
│   └── BankCardGenerator.jsx       # Module 2: PDF generation
├── utils/
│   ├── addressLogic.js             # Address formatting & validation
│   └── pdfTemplates.js             # PDF template generation
├── store/
│   └── addressStore.js             # Zustand state management
├── App.jsx                         # Main application
└── index.css                       # Tailwind CSS configuration
```

## 🎨 Design Philosophy

- **Mobile-First**: Large touch targets, responsive design
- **Privacy-Focused**: All processing happens in your browser (no server uploads)
- **Enterprise Theme**: Professional blue/white/slate color palette
- **Accessible**: Semantic HTML, proper contrast, keyboard navigable

## 📝 Usage Guide

### Step 1: Build Your Address

1. Optionally search for a location using OpenStreetMap autocomplete
2. Fill in the address fields:
   - Building/Landmark name
   - Street name
   - Area/Estate
   - City
   - Postal code
3. Review the formatted address preview
4. Ensure validation shows ✅ (green checkmark)

### Step 2: Generate Bank Instructions

1. Select your bank from the dropdown
2. Click "Generate Bank Instructions (PDF)"
3. Print or save the PDF to your phone

### Step 3: Visit Your Bank

1. Present the PDF to the bank teller
2. Request they update your address EXACTLY as shown
3. Ask for a 1-page interim statement with the new address
4. Use that statement for platform verification

## 🔒 Privacy & Security

- ✅ **100% Client-Side Processing**: No data sent to any server
- ✅ **No Storage**: Nothing is saved or cached
- ✅ **No Tracking**: No analytics or tracking scripts
- ✅ **Open Source**: Review the code yourself

## 🤝 Contributing

Contributions are welcome! This project aims to help developers across the Global South navigate compliance challenges.

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🌍 Roadmap

- [ ] Expand to more African countries (Nigeria, Ghana, South Africa)
- [ ] Add more bank templates
- [ ] Implement Module 3 (OCR Validator)
- [ ] Add language support (Swahili, French, Portuguese)
- [ ] Mobile app version

## 💬 Support

If you encounter issues or have questions:

1. Check that you're using Node.js 18+
2. Ensure Tailwind CSS 3.x is installed (not v4)
3. Clear browser cache and restart the dev server

---

**Built with ❤️ for developers navigating international compliance challenges**
