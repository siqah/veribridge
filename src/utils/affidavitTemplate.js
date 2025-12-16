import { jsPDF } from "jspdf";

/**
 * Generates a professional Affidavit of Residence PDF
 * @param {Object} userData - User data for the affidavit
 * @param {string} userData.fullName - User's full legal name
 * @param {string} userData.idNumber - National ID number
 * @param {string} userData.formattedAddress - The VeriBridge formatted address
 * @param {string} userData.city - City for swearing
 * @returns {jsPDF} - The generated PDF document
 */
export function generateAffidavitPDF(userData) {
  const { fullName, idNumber, formattedAddress, city } = userData;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Header - Republic of Kenya
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPUBLIC OF KENYA", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    "IN ACCORDANCE WITH THE OATHS AND STATUTORY DECLARATIONS ACT",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 5;
  doc.text("(Chapter 15, Laws of Kenya)", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("AFFIDAVIT OF RESIDENCE", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Preamble
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const preamble = `I, ${fullName.toUpperCase()}, holder of National Identity Card Number ${idNumber}, do hereby make oath and solemnly declare as follows:`;
  const splitPreamble = doc.splitTextToSize(preamble, contentWidth);
  doc.text(splitPreamble, margin, yPosition);
  yPosition += splitPreamble.length * 6 + 10;

  // Declarations
  const declarations = [
    "That I am an adult citizen of the Republic of Kenya and am competent to make this affidavit.",
    `That I am a bona fide resident of the Republic of Kenya, and my true and correct physical residential address is:`,
  ];

  let declarationNum = 1;
  declarations.forEach((declaration) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${declarationNum}.`, margin, yPosition);
    doc.setFont("helvetica", "normal");
    const splitDeclaration = doc.splitTextToSize(
      declaration,
      contentWidth - 10
    );
    doc.text(splitDeclaration, margin + 8, yPosition);
    yPosition += splitDeclaration.length * 6 + 5;
    declarationNum++;
  });

  // Address Box
  const boxHeight = 25;
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(0.5);
  doc.roundedRect(
    margin + 8,
    yPosition,
    contentWidth - 16,
    boxHeight,
    2,
    2,
    "FD"
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 64, 175);
  const addressLines = doc.splitTextToSize(formattedAddress, contentWidth - 26);
  doc.text(addressLines, margin + 15, yPosition + 10);

  yPosition += boxHeight + 10;
  doc.setTextColor(0, 0, 0);

  // Continue declarations
  const moreDeclarations = [
    "That the aforementioned address is my principal place of residence where I can be physically located.",
    "That this affidavit is made for the purpose of identity verification with international digital platforms and Know Your Customer (KYC) compliance requirements.",
    "That I am aware that making a false declaration is an offence punishable under the laws of Kenya.",
    "That the contents of this affidavit are true and correct to the best of my knowledge and belief.",
  ];

  doc.setFontSize(11);
  moreDeclarations.forEach((declaration) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${declarationNum}.`, margin, yPosition);
    doc.setFont("helvetica", "normal");
    const splitDeclaration = doc.splitTextToSize(
      declaration,
      contentWidth - 10
    );
    doc.text(splitDeclaration, margin + 8, yPosition);
    yPosition += splitDeclaration.length * 6 + 5;
    declarationNum++;
  });

  yPosition += 5;

  // Date and signature section
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.text(
    `SWORN at ${city.toUpperCase()} this _______ day of _________________ 20____`,
    margin,
    yPosition
  );
  yPosition += 15;

  // Deponent section
  doc.text("_______________________________", margin, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "bold");
  doc.text("DEPONENT (Signature)", margin, yPosition);
  yPosition += 15;

  // Commissioner for Oaths section
  doc.setFont("helvetica", "normal");
  doc.text("BEFORE ME:", margin, yPosition);
  yPosition += 10;

  doc.text("_______________________________", margin, yPosition);
  yPosition += 5;
  doc.setFont("helvetica", "bold");
  doc.text("COMMISSIONER FOR OATHS", margin, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.text("Name: ___________________________", margin, yPosition);
  yPosition += 6;
  doc.text("Stamp & Seal:", margin, yPosition);

  // Draw a box for the stamp
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(margin + 30, yPosition - 3, 40, 25);
  doc.setLineDashPattern([], 0);

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This affidavit was prepared using VeriBridge - Address Verification for Developers",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  doc.text(`Generated on ${currentDate}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  return doc;
}

/**
 * Downloads the affidavit PDF
 * @param {jsPDF} doc - The PDF document
 * @param {string} filename - The filename for download
 */
export function downloadAffidavit(
  doc,
  filename = "Affidavit_of_Residence.pdf"
) {
  doc.save(filename);
}
