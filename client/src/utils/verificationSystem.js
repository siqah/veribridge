import QRCode from "qrcode";

// Configuration
const VERIBADGE_DOMAIN = "veribadge.co.ke"; // Future domain
const VERIBADGE_URL = `https://${VERIBADGE_DOMAIN}`;

/**
 * Generates a unique verification ID
 * Format: VB-[TIMESTAMP_BASE36]-[RANDOM_4CHARS]
 * Example: VB-M3X7K2-A8F2
 */
export function generateVerificationId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VB-${timestamp}-${random}`;
}

/**
 * Generates the verification URL for a given ID
 */
export function getVerificationUrl(verificationId) {
  return `${VERIBADGE_URL}/verify/${verificationId}`;
}

/**
 * Generates a QR code as a data URL
 * @param {string} verificationId - The verification ID
 * @returns {Promise<string>} - Base64 data URL of the QR code
 */
export async function generateVerificationQRCode(verificationId) {
  const url = getVerificationUrl(verificationId);

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      width: 150,
      margin: 1,
      color: {
        dark: "#1e40af", // VeriBadge blue
        light: "#ffffff",
      },
    });

    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
}

/**
 * Creates a verification record (for future backend integration)
 * Currently stores in localStorage for demo purposes
 */
export function createVerificationRecord(data) {
  const record = {
    id: data.verificationId,
    fullName: data.fullName,
    idNumber: data.idNumber,
    formattedAddress: data.formattedAddress,
    country: data.country,
    platform: data.platform,
    createdAt: new Date().toISOString(),
    status: "VERIFIED",
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
  };

  // Store in localStorage for now (will be replaced with API call)
  try {
    const records = JSON.parse(
      localStorage.getItem("veribadge_records") || "[]"
    );
    records.push(record);
    localStorage.setItem("veribadge_records", JSON.stringify(records));
  } catch (e) {
    console.error("Error storing record:", e);
  }

  return record;
}

/**
 * Looks up a verification record by ID
 */
export function lookupVerificationRecord(verificationId) {
  try {
    const records = JSON.parse(
      localStorage.getItem("veribadge_records") || "[]"
    );
    return records.find((r) => r.id === verificationId) || null;
  } catch (e) {
    console.error("Error looking up record:", e);
    return null;
  }
}

/**
 * Formats the verification status for display
 */
export function getVerificationStatusBadge(status) {
  const badges = {
    VERIFIED: { text: "✓ Verified", color: "green" },
    PENDING: { text: "⏳ Pending", color: "yellow" },
    EXPIRED: { text: "⚠ Expired", color: "red" },
    REVOKED: { text: "✗ Revoked", color: "red" },
  };

  return badges[status] || badges.PENDING;
}

/**
 * Generates verification metadata for PDF embedding
 */
export function generateVerificationMetadata(verificationId, userData) {
  return {
    verificationId,
    url: getVerificationUrl(verificationId),
    issuedAt: new Date().toISOString(),
    issuer: "VeriBadge Verification Services",
    subject: userData.fullName,
    purpose: `${userData.platform} Account Verification`,
    validity: "12 months from issue date",
  };
}
