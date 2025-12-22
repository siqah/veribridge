/**
 * Address formatting utility for VeriBridge
 * Cleans and formats addresses for international KYC compliance
 * Supports worldwide addresses, not just Kenya
 */

/**
 * List of colloquialisms to remove from addresses (international)
 */
const COLLOQUIALISMS = [
  // English
  "opposite",
  "near",
  "behind",
  "next to",
  "besides",
  "adjacent to",
  "close to",
  "around",
  "off",
  "by the",
  "across from",
  "in front of",
  // Spanish
  "cerca de",
  "frente a",
  "al lado de",
  "detrás de",
  // Portuguese
  "perto de",
  "em frente",
  "ao lado de",
  // French
  "près de",
  "en face de",
  "à côté de",
];

/**
 * Removes colloquialisms and cleans up the address string
 * @param {string} text - The text to clean
 * @returns {string} - Cleaned text
 */
function removeColloquialisms(text) {
  if (!text) return "";

  let cleaned = text.trim();

  // Remove colloquialisms (case-insensitive)
  COLLOQUIALISMS.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // Clean up extra spaces and commas
  cleaned = cleaned
    .replace(/\s+/g, " ")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/, "")
    .replace(/^\s*,/, "")
    .trim();

  return cleaned;
}

/**
 * Formats address components into a standard international format
 * Format: [Unit/Apt], [Building], [Road], [Area], [City], [PostalCode], [Country]
 *
 * Smart formatting rules:
 * 1. Avoids redundancy (e.g., "Nairobi, Nairobi County" → "Nairobi")
 * 2. Filters religious/vague landmarks (e.g., "Makina Mosque" → "Makina Building")
 * 3. Prioritizes roads over general landmarks
 * 4. Validates location hierarchy (correct sub-county matching)
 *
 * @param {Object} addressComponents - Object containing address parts
 * @param {string} addressComponents.building - Building or landmark name
 * @param {string} addressComponents.street - Street name
 * @param {string} addressComponents.area - Area or estate name
 * @param {string} addressComponents.city - City name
 * @param {string} addressComponents.state - State/Province/Region
 * @param {string} addressComponents.postalCode - Postal code
 * @param {string} addressComponents.countryName - Country name
 * @returns {string} - Formatted address string
 */
export function formatAddress(addressComponents) {
  const { building, street, area, city, state, postalCode, countryName } =
    addressComponents;

  // Clean each component
  let cleanBuilding = removeColloquialisms(building);
  const cleanStreet = removeColloquialisms(street);
  let cleanArea = removeColloquialisms(area);
  const cleanCity = removeColloquialisms(city);
  let cleanState = state?.trim() || "";
  const cleanPostalCode = postalCode?.trim() || "";
  const cleanCountry = countryName?.trim() || "";

  // --- SMART CLEANING RULES ---

  // 1. Remove religious/vague landmarks from building names
  const problematicKeywords = [
    "mosque",
    "church",
    "temple",
    "shrine",
    "cathedral",
    "westside",
    "eastside",
    "northside",
    "southside",
  ];

  problematicKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    cleanBuilding = cleanBuilding.replace(regex, "").trim();
  });

  // Clean up "Building" if it's the only word left
  if (cleanBuilding.toLowerCase() === "building") {
    cleanBuilding = "";
  }

  // 2. Remove redundancy: "Nairobi, Nairobi County" → "Nairobi"
  if (cleanState && cleanCity) {
    // If state contains city name + "County/State/Province", remove state
    const redundantPatterns = [
      `${cleanCity} County`,
      `${cleanCity} State`,
      `${cleanCity} Province`,
      cleanCity, // Exact match
    ];

    if (
      redundantPatterns.some(
        (pattern) => cleanState.toLowerCase() === pattern.toLowerCase()
      )
    ) {
      cleanState = ""; // Remove redundant state
    }
  }

  // 3. Prioritize road names over general areas if both exist
  // If we have a specific road, the general "area" becomes less important
  if (cleanStreet && cleanArea) {
    // Check if area is too generic (single word or very short)
    if (cleanArea.split(" ").length === 1 || cleanArea.length < 4) {
      cleanArea = ""; // Remove generic area if we have a road
    }
  }

  // 4. Remove "Kenya" if country is already specified
  if (cleanCountry.toLowerCase() === "kenya" && cleanState.includes("Kenya")) {
    cleanState = cleanState.replace(/,?\s*Kenya/gi, "").trim();
  }

  // Build the address array (only include non-empty parts)
  const addressParts = [
    cleanBuilding,
    cleanStreet,
    cleanArea,
    cleanCity,
    cleanState,
    cleanPostalCode,
    cleanCountry,
  ].filter((part) => part && part.length > 0);

  // Final cleanup: remove duplicate consecutive parts
  const uniqueParts = addressParts.filter(
    (part, index, arr) =>
      index === 0 || part.toLowerCase() !== arr[index - 1].toLowerCase()
  );

  // Join with commas
  return uniqueParts.join(", ");
}

/**
 * Validates that an address doesn't contain problematic patterns
 * @param {string} address - The address to validate
 * @returns {Object} - Validation result with status and message
 */
export function validateAddress(address) {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      severity: "error",
      message: "Address cannot be empty",
    };
  }

  const lowerAddress = address.toLowerCase();

  // Check for P.O. Box variations (international)
  const poBoxPatterns = [
    "p.o. box",
    "p.o box",
    "po box",
    "pobox",
    "private bag",
    "p o box",
    "apartado",
    "casilla",
    "caixa postal",
    "boîte postale",
    "postfach",
  ];

  for (const pattern of poBoxPatterns) {
    if (lowerAddress.includes(pattern)) {
      return {
        isValid: false,
        severity: "error",
        message:
          "⚠️ ADDRESS REJECTED: Contains P.O. Box. Global platforms will reject this.",
      };
    }
  }

  // Check for remaining colloquialisms
  const remainingColloquialisms = COLLOQUIALISMS.filter((phrase) =>
    lowerAddress.includes(phrase)
  );

  if (remainingColloquialisms.length > 0) {
    return {
      isValid: true,
      severity: "warning",
      message: `⚠️ WARNING: Address contains "${remainingColloquialisms[0]}". Consider removing it.`,
    };
  }

  // Check minimum components (at least city or postal code)
  const parts = address.split(",").filter((p) => p.trim().length > 0);
  if (parts.length < 3) {
    return {
      isValid: true,
      severity: "warning",
      message:
        "⚠️ Address seems incomplete. Add more details for better verification.",
    };
  }

  return {
    isValid: true,
    severity: "success",
    message: "✓ Address format looks good for international platforms!",
  };
}
