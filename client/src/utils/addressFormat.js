/**
 * Generates standardized address format for forms
 * Outputs in the format banks/platforms expect:
 * - Address Line 1: Building + Road
 * - Address Line 2: Area/Neighborhood
 * - City/Town
 * - Postal Code
 * - Country
 */

export function generateStandardAddressFormat(components) {
  const { building, street, area, city, postalCode, countryName } = components;

  // Address Line 1: Combine building and street
  const line1Parts = [building, street].filter((p) => p && p.trim());
  const addressLine1 = line1Parts.join(", ") || "";

  // Address Line 2: Area/neighborhood
  const addressLine2 = area || "";

  // City/Town
  const cityTown = city || "";

  // Postal Code
  const postal = postalCode || "";

  // Country
  const country = countryName || "";

  return {
    addressLine1,
    addressLine2,
    cityTown,
    postalCode: postal,
    country,
    // Full formatted version for display
    fullAddress: [addressLine1, addressLine2, cityTown, postal, country]
      .filter((p) => p)
      .join(", "),
  };
}
