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
 * Format varies by country but generally:
 * [Building], [Street], [Area], [City], [State/Province], [Postal Code], [Country]
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
  const cleanBuilding = removeColloquialisms(building);
  const cleanStreet = removeColloquialisms(street);
  const cleanArea = removeColloquialisms(area);
  const cleanCity = removeColloquialisms(city);
  const cleanState = state?.trim() || "";
  const cleanPostalCode = postalCode?.trim() || "";
  const cleanCountry = countryName?.trim() || "";

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

  // Join with commas and clean up
  return addressParts.join(", ");
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
