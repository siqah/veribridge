import { jsPDF } from "jspdf";

/**
 * Bank information for Kenyan banks
 */
const BANK_INFO = {
  equity: {
    name: "Equity Bank",
    code: "EQBNKE",
  },
  kcb: {
    name: "Kenya Commercial Bank (KCB)",
    code: "KCBLKE",
  },
  coop: {
    name: "Co-operative Bank of Kenya",
    code: "COOPKE",
  },
  ncba: {
    name: "NCBA Bank Kenya",
    code: "NCBAKE",
  },
  stanbic: {
    name: "Stanbic Bank Kenya",
    code: "SBICKE",
  },
  absa: {
    name: "Absa Bank Kenya",
    code: "BABORKE",
  },
  dtb: {
    name: "Diamond Trust Bank (DTB)",
    code: "DABORKE",
  },
  im: {
    name: "I&M Bank Kenya",
    code: "IMBAKE",
  },
  family: {
    name: "Family Bank",
    code: "FBBLKE",
  },
  boa: {
    name: "Bank of Africa Kenya",
    code: "AFRIKENX",
  },
  prime: {
    name: "Prime Bank Kenya",
    code: "PRABORKE",
  },
  standard: {
    name: "Standard Chartered Kenya",
    code: "SCBLKENX",
  },
};

/**
 * Generates a professional PDF with bank instructions
 * @param {string} bankId - The bank identifier (equity, kcb, coop, ncba)
 * @param {string} formattedAddress - The formatted address string
 * @param {string} customerName - Optional customer name
 * @returns {jsPDF} - The generated PDF document
 */
export function generateBankInstructionPDF(
  bankId,
  formattedAddress,
  customerName = ""
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const bank = BANK_INFO[bankId] || BANK_INFO.equity;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Header Section - Blue background
  doc.setFillColor(30, 64, 175); // primary-dark blue
  doc.rect(0, 0, pageWidth, 40, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CUSTOMER PROFILE UPDATE REQUEST", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("International KYC Compliance Documentation", pageWidth / 2, 30, {
    align: "center",
  });

  yPosition = 55;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Date: ${currentDate}`, margin, yPosition);
  yPosition += 10;

  // Bank name
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`To: ${bank.name}`, margin, yPosition);
  yPosition += 15;

  // Salutation
  doc.setFont("helvetica", "normal");
  doc.text("Dear Sir/Madam,", margin, yPosition);
  yPosition += 10;

  // Main request paragraph
  doc.setFontSize(10);
  const requestText =
    "I request to update my Physical Residential Address for International KYC Compliance purposes. This update is required for verification on global platforms (Google Play Console, Amazon, etc.).";
  const splitRequest = doc.splitTextToSize(requestText, contentWidth);
  doc.text(splitRequest, margin, yPosition);
  yPosition += splitRequest.length * 5 + 10;

  // Instruction
  doc.setFont("helvetica", "bold");
  doc.text(
    "Please enter the following address EXACTLY as shown in your core banking system:",
    margin,
    yPosition
  );
  yPosition += 10;

  // Address Box - Light blue background
  const boxHeight = 25;
  doc.setFillColor(219, 234, 254); // Light blue
  doc.setDrawColor(59, 130, 246); // Primary blue border
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, contentWidth, boxHeight, 3, 3, "FD");

  // Address text inside box
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175); // Dark blue text
  const addressLines = doc.splitTextToSize(formattedAddress, contentWidth - 10);
  const addressYStart = yPosition + boxHeight / 2 - addressLines.length * 3;
  doc.text(addressLines, margin + 5, addressYStart + 5);

  yPosition += boxHeight + 15;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Warning Box - Red border
  doc.setFillColor(254, 242, 242); // Light red background
  doc.setDrawColor(220, 38, 38); // Red border
  doc.setLineWidth(0.5);
  const warningHeight = 30;
  doc.roundedRect(margin, yPosition, contentWidth, warningHeight, 3, 3, "FD");

  // Warning icon and text
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28); // Dark red
  doc.text("⚠  IMPORTANT INSTRUCTIONS:", margin + 5, yPosition + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const warningText = [
    "• DO NOT use P.O. Box, Private Bag, or any postal address",
    '• DO NOT use words like "Near", "Opposite", "Behind", or "Next to"',
    "• Type the address EXACTLY as shown above",
  ];

  warningText.forEach((line, index) => {
    doc.text(line, margin + 5, yPosition + 15 + index * 5);
  });

  yPosition += warningHeight + 15;

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Statement request
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("After updating the address, please provide:", margin, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  doc.text(
    "• A 1-page interim bank statement showing the updated address in the header",
    margin + 5,
    yPosition
  );
  yPosition += 6;
  doc.text(
    "• Ensure the address is clearly visible at the top of the statement",
    margin + 5,
    yPosition
  );
  yPosition += 15;

  // Closing
  doc.text("Thank you for your assistance.", margin, yPosition);
  yPosition += 10;

  doc.text("Yours sincerely,", margin, yPosition);
  yPosition += 15;

  // Signature line
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition, margin + 60, yPosition);
  yPosition += 5;

  if (customerName) {
    doc.setFont("helvetica", "bold");
    doc.text(customerName, margin, yPosition);
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("(Customer Signature)", margin, yPosition);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const footerText =
    "Generated by VeriBridge - Address Verification for Developers";
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });

  return doc;
}

/**
 * Downloads the generated PDF
 * @param {jsPDF} doc - The PDF document
 * @param {string} filename - The filename for the download
 */
export function downloadPDF(doc, filename = "bank_address_update_request.pdf") {
  doc.save(filename);
}

/**
 * Generates and downloads the bank instruction PDF
 * @param {string} bankId - The bank identifier
 * @param {string} formattedAddress - The formatted address
 * @param {string} customerName - Optional customer name
 */
export function generateAndDownloadBankInstructions(
  bankId,
  formattedAddress,
  customerName = ""
) {
  const doc = generateBankInstructionPDF(
    bankId,
    formattedAddress,
    customerName
  );
  const sanitizedBankName =
    BANK_INFO[bankId]?.name.replace(/\s+/g, "_").toLowerCase() || "bank";
  const filename = `${sanitizedBankName}_address_update_${Date.now()}.pdf`;
  downloadPDF(doc, filename);
}

/**
 * Get list of available banks
 * @returns {Array} - Array of bank objects with id and name
 */
export function getAvailableBanks() {
  return Object.entries(BANK_INFO).map(([id, info]) => ({
    id,
    name: info.name,
  }));
}
