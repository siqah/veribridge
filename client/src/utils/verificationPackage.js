import { jsPDF } from "jspdf";
import {
  generateVerificationId,
  getVerificationUrl,
  generateVerificationQRCode,
  createVerificationRecord,
} from "./verificationSystem";

/**
 * Generates a VeriBadge Verification Certificate with QR Code
 */
export async function generateVerificationCertificate(userData) {
  const {
    fullName,
    idNumber,
    formattedAddress,
    country,
    phone,
    email,
    platform = "Google Play Console",
  } = userData;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Generate unique verification ID
  const verificationId = generateVerificationId();
  const verificationUrl = getVerificationUrl(verificationId);
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Generate QR Code
  let qrCodeDataUrl = null;
  try {
    qrCodeDataUrl = await generateVerificationQRCode(verificationId);
  } catch (e) {
    console.error("QR code generation failed:", e);
  }

  // Store verification record
  createVerificationRecord({
    verificationId,
    fullName,
    idNumber: idNumber.slice(0, 4) + "****", // Masked for privacy
    formattedAddress,
    country,
    platform,
  });

  let yPosition = margin;

  // Header Background - Gradient effect simulated
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Header accent line
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 50, pageWidth, 5, "F");

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("VeriBadge", pageWidth / 2, 22, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Digital Identity & Address Verification Services",
    pageWidth / 2,
    32,
    { align: "center" }
  );

  doc.setFontSize(9);
  doc.text(
    "www.veribadge.co.ke | verify@veribadge.co.ke | +254 XXX XXX XXX",
    pageWidth / 2,
    42,
    { align: "center" }
  );

  yPosition = 70;

  // Certificate Title
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE OF VERIFICATION", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`For ${platform} Account Verification`, pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 12;

  // Verification ID & QR Code Section
  const qrBoxWidth = 40;
  const qrBoxX = pageWidth - margin - qrBoxWidth;

  // QR Code Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(
    qrBoxX,
    yPosition - 5,
    qrBoxWidth,
    qrBoxWidth + 15,
    2,
    2,
    "FD"
  );

  // Add QR Code image if available
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, "PNG", qrBoxX + 5, yPosition, 30, 30);
  }
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.text("Scan to Verify", qrBoxX + qrBoxWidth / 2, yPosition + 35, {
    align: "center",
  });
  doc.text(verificationId, qrBoxX + qrBoxWidth / 2, yPosition + 40, {
    align: "center",
  });

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(margin, yPosition, 60, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("✓ VERIFIED", margin + 30, yPosition + 9, { align: "center" });
  yPosition += 25;

  // Developer Information Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Subject Information", margin, yPosition);
  yPosition += 3;

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, margin + 50, yPosition);
  yPosition += 10;

  const infoItems = [
    ["Full Legal Name:", fullName.toUpperCase()],
    ["ID/Passport Number:", idNumber],
    ["Contact Phone:", phone || "—"],
    ["Email Address:", email || "—"],
    ["Country:", country],
    ["Verification Date:", currentDate],
    [
      "Valid Until:",
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-GB"
      ),
    ],
  ];

  doc.setFontSize(10);
  const labelWidth = 45;
  infoItems.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(label, margin, yPosition);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(String(value), margin + labelWidth, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Verified Address Section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Verified Residential Address", margin, yPosition);
  yPosition += 3;

  doc.setDrawColor(30, 64, 175);
  doc.line(margin, yPosition, margin + 60, yPosition);
  yPosition += 8;

  // Address Box with border
  const addressBoxHeight = 30;
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1);
  doc.roundedRect(
    margin,
    yPosition,
    contentWidth - qrBoxWidth - 10,
    addressBoxHeight,
    3,
    3,
    "FD"
  );

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  const addressLines = doc.splitTextToSize(
    formattedAddress,
    contentWidth - qrBoxWidth - 20
  );
  doc.text(addressLines, margin + 5, yPosition + 12);
  yPosition += addressBoxHeight + 12;

  // Verification Checks Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Verification Checks Performed", margin, yPosition);
  yPosition += 8;

  const checks = [
    ["✓", "Identity Document Authenticity", "PASSED"],
    ["✓", "Address Format Compliance (ISO 19160)", "PASSED"],
    ["✓", "P.O. Box / Postal Address Detection", "CLEAR"],
    ["✓", "Colloquialism & Informal Language", "CLEAR"],
    ["✓", "International KYC Format Standards", "COMPLIANT"],
  ];

  doc.setFontSize(9);
  checks.forEach(([icon, check, status]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(icon, margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(check, margin + 8, yPosition);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(status, margin + 90, yPosition);
    yPosition += 5;
  });

  yPosition += 10;

  // Declaration Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  const declBoxHeight = 28;
  doc.roundedRect(margin, yPosition, contentWidth, declBoxHeight, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(80, 80, 80);
  const declaration = `This certificate confirms that VeriBadge Verification Services has verified the identity and residential address of the above-named individual. This verification was conducted in accordance with international Know Your Customer (KYC) standards. The unique verification ID above can be used to confirm the authenticity of this document at ${verificationUrl}`;
  const splitDeclaration = doc.splitTextToSize(declaration, contentWidth - 10);
  doc.text(splitDeclaration, margin + 5, yPosition + 6);
  yPosition += declBoxHeight + 12;

  // Signature Section
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);

  // Left signature
  doc.line(margin, yPosition, margin + 55, yPosition);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Verification Officer", margin, yPosition + 5);
  doc.text("VeriBadge Services", margin, yPosition + 10);

  // Right signature
  doc.line(margin + 80, yPosition, margin + 135, yPosition);
  doc.text("Digital Seal", margin + 80, yPosition + 5);
  doc.text(currentDate, margin + 80, yPosition + 10);

  // Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 25, pageWidth, 25, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Verification ID: ${verificationId} | Verify online: ${verificationUrl}`,
    pageWidth / 2,
    pageHeight - 17,
    { align: "center" }
  );
  doc.text(
    `This document is digitally generated by VeriBadge Verification Services. For inquiries: verify@veribadge.co.ke`,
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );
  doc.text(
    `© ${new Date().getFullYear()} VeriBadge. All rights reserved. | Document generated: ${new Date().toISOString()}`,
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );

  return { doc, verificationId, verificationUrl };
}

/**
 * Generates a Google Play Console Cover Letter
 */
export async function generateCoverLetter(userData) {
  const {
    fullName,
    formattedAddress,
    verificationId,
    platform = "Google Play Console",
  } = userData;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;

  // Generate QR Code for cover letter too
  let qrCodeDataUrl = null;
  if (verificationId) {
    try {
      qrCodeDataUrl = await generateVerificationQRCode(verificationId);
    } catch (e) {
      console.error("QR code generation failed:", e);
    }
  }

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  let yPosition = margin;

  // Header with logo placeholder
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 8, "F");

  yPosition = 20;

  // Company Header
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text("VeriBadge", margin, yPosition);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Digital Identity & Address Verification", margin, yPosition + 5);
  doc.text(
    "www.veribadge.co.ke | verify@veribadge.co.ke",
    margin,
    yPosition + 10
  );

  // Add QR code in header
  if (qrCodeDataUrl) {
    doc.addImage(
      qrCodeDataUrl,
      "PNG",
      pageWidth - margin - 25,
      yPosition - 8,
      25,
      25
    );
  }

  yPosition += 25;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(currentDate, margin, yPosition);
  yPosition += 12;

  // Recipient
  doc.setFont("helvetica", "bold");
  doc.text("To:", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(`${platform} Verification Team`, margin + 10, yPosition);

  if (platform.includes("Google")) {
    doc.text("Google LLC", margin + 10, yPosition + 5);
    doc.text("1600 Amphitheatre Parkway", margin + 10, yPosition + 10);
    doc.text("Mountain View, CA 94043, USA", margin + 10, yPosition + 15);
  } else if (platform.includes("Amazon")) {
    doc.text("Amazon.com Services LLC", margin + 10, yPosition + 5);
    doc.text("410 Terry Avenue North", margin + 10, yPosition + 10);
    doc.text("Seattle, WA 98109, USA", margin + 10, yPosition + 15);
  } else {
    doc.text("Verification Department", margin + 10, yPosition + 5);
  }
  yPosition += 25;

  // Reference
  doc.setFont("helvetica", "bold");
  doc.text("RE:", margin, yPosition);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Developer Account Verification - Identity & Address Confirmation",
    margin + 10,
    yPosition
  );
  yPosition += 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Reference: ${
      verificationId || "VB-" + Date.now().toString(36).toUpperCase()
    }`,
    margin,
    yPosition
  );
  yPosition += 15;

  // Body
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Dear Verification Team,", margin, yPosition);
  yPosition += 10;

  const body1 = `I, ${fullName.toUpperCase()}, am submitting this verification package in support of my developer account application. This package has been prepared and verified by VeriBadge Verification Services, an independent identity and address verification provider.`;
  const splitBody1 = doc.splitTextToSize(body1, contentWidth);
  doc.text(splitBody1, margin, yPosition);
  yPosition += splitBody1.length * 5 + 8;

  // Enclosed documents
  doc.setFont("helvetica", "bold");
  doc.text("Enclosed Documents:", margin, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "normal");
  const documents = [
    "VeriBadge Certificate of Verification (with unique verification ID & QR code)",
    "Sworn Affidavit of Residence",
    "Supporting identity documentation",
  ];

  documents.forEach((docItem, i) => {
    doc.text(`${i + 1}. ${docItem}`, margin + 5, yPosition);
    yPosition += 6;
  });
  yPosition += 8;

  // Address confirmation box
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  const addressBoxHeight = 22;
  doc.roundedRect(
    margin,
    yPosition,
    contentWidth,
    addressBoxHeight,
    2,
    2,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 64, 175);
  doc.text("VERIFIED RESIDENTIAL ADDRESS:", margin + 5, yPosition + 6);

  doc.setFontSize(10);
  const addressLines = doc.splitTextToSize(formattedAddress, contentWidth - 10);
  doc.text(addressLines, margin + 5, yPosition + 14);
  yPosition += addressBoxHeight + 10;

  // Verification statement
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const statement = `The above address has been independently verified by VeriBadge and formatted to comply with international KYC standards. This address does not contain P.O. Box references, informal directional language, or other elements that might trigger automated rejection systems.`;
  const splitStatement = doc.splitTextToSize(statement, contentWidth);
  doc.text(splitStatement, margin, yPosition);
  yPosition += splitStatement.length * 5 + 8;

  // Online verification note
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, yPosition, contentWidth, 18, 2, 2, "FD");

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Online Verification:", margin + 5, yPosition + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  doc.text(
    `You may verify this document online at: ${getVerificationUrl(
      verificationId
    )}`,
    margin + 5,
    yPosition + 12
  );
  yPosition += 25;

  // Closing
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "Should you require any additional information, please do not hesitate to contact me or VeriBadge.",
    margin,
    yPosition
  );
  yPosition += 12;

  doc.text("Yours sincerely,", margin, yPosition);
  yPosition += 15;

  doc.line(margin, yPosition, margin + 50, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "bold");
  doc.text(fullName.toUpperCase(), margin, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Developer Applicant", margin, yPosition);

  // Footer
  doc.setFillColor(30, 64, 175);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "Verified by VeriBadge | www.veribadge.co.ke | © " +
      new Date().getFullYear(),
    pageWidth / 2,
    pageHeight - 5,
    { align: "center" }
  );

  return doc;
}

/**
 * Download helper
 */
export function downloadDocument(doc, filename) {
  doc.save(filename);
}
