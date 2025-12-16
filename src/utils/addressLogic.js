/**
 * Address formatting utility for VeriBridge
 * Cleans and formats Kenyan addresses for international KYC compliance
 */

/**
 * List of colloquialisms to remove from addresses
 */
const COLLOQUIALISMS = [
  "opposite",
  "near",
  "behind",
  "next to",
  "besides",
  "adjacent to",
  "close to",
  "around",
  "off",
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
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/,\s*,/g, ",") // Multiple commas to single comma
    .replace(/,\s*$/, "") // Trailing comma
    .replace(/^\s*,/, "") // Leading comma
    .trim();

  return cleaned;
}

/**
 * Formats address components into a strict Western-style address
 * Format: [Building Name], [Street Name], [Area/Estate], [City], [Postal Code]
 *
 * @param {Object} addressComponents - Object containing address parts
 * @param {string} addressComponents.building - Building or landmark name
 * @param {string} addressComponents.street - Street name
 * @param {string} addressComponents.area - Area or estate name
 * @param {string} addressComponents.city - City name
 * @param {string} addressComponents.postalCode - Postal code
 * @returns {string} - Formatted address string
 */
export function formatAddress(addressComponents) {
  const { building, street, area, city, postalCode } = addressComponents;

  // Clean each component
  const cleanBuilding = removeColloquialisms(building);
  const cleanStreet = removeColloquialisms(street);
  const cleanArea = removeColloquialisms(area);
  const cleanCity = removeColloquialisms(city);
  const cleanPostalCode = postalCode?.trim() || "";

  // Build the address array (only include non-empty parts)
  const addressParts = [
    cleanBuilding,
    cleanStreet,
    cleanArea,
    cleanCity,
    cleanPostalCode,
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

  // Check for P.O. Box variations
  const poBoxPatterns = [
    "p.o. box",
    "p.o box",
    "po box",
    "pobox",
    "private bag",
    "p o box",
  ];

  for (const pattern of poBoxPatterns) {
    if (lowerAddress.includes(pattern)) {
      return {
        isValid: false,
        severity: "error",
        message:
          "⚠️ ADDRESS REJECTED: Contains P.O. Box. Global platforms will ban this.",
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

  return {
    isValid: true,
    severity: "success",
    message: "✓ Address format looks good!",
  };
}
