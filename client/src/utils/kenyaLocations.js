/**
 * Kenya-specific postal code and location data
 * Maps areas to their correct postal codes and sub-counties
 */

export const KENYA_LOCATIONS = {
  // Nairobi Sub-Counties and their postal codes
  makina: {
    subCounty: "Kibra",
    postalCode: "00504",
    roads: ["Kibera Drive", "Sheikh Mahmoud Road"],
  },
  kibera: {
    subCounty: "Kibra",
    postalCode: "00504",
    roads: ["Kibera Drive", "Mbagathi Way"],
  },
  "sarang'ombe": {
    subCounty: "Kibra",
    postalCode: "00504",
    roads: ["Kibera Drive"],
  },
  "laini saba": {
    subCounty: "Kibra",
    postalCode: "00504",
    roads: ["Mbagathi Way"],
  },

  cbd: {
    subCounty: "Starehe",
    postalCode: "00100",
    roads: ["Kenyatta Avenue", "Moi Avenue"],
  },
  pangani: {
    subCounty: "Starehe",
    postalCode: "00610",
    roads: ["Jogoo Road", "Juja Road"],
  },
  ngara: {
    subCounty: "Starehe",
    postalCode: "00106",
    roads: ["Ngara Road", "Limuru Road"],
  },

  westlands: {
    subCounty: "Westlands",
    postalCode: "00800",
    roads: ["Waiyaki Way", "Parklands Road"],
  },
  parklands: {
    subCounty: "Westlands",
    postalCode: "00623",
    roads: ["Parklands Road", "Limuru Road"],
  },

  kasarani: {
    subCounty: "Kasarani",
    postalCode: "00618",
    roads: ["Thika Road", "Kasarani Road"],
  },
  ruaraka: {
    subCounty: "Kasarani",
    postalCode: "00618",
    roads: ["Thika Road", "Outering Road"],
  },

  embakasi: {
    subCounty: "Embakasi",
    postalCode: "00200",
    roads: ["Mombasa Road", "Jogoo Road"],
  },
  umoja: {
    subCounty: "Embakasi",
    postalCode: "00103",
    roads: ["Kangundo Road", "Outer Ring Road"],
  },
};

/**
 * Detects location conflicts in Kenyan addresses
 * @param {string} area - The area name
 * @param {string} subCounty - The declared sub-county
 * @returns {Object} Conflict detection result
 */
export function detectLocationConflict(area, subCounty) {
  if (!area || !subCounty) return null;

  const normalizedArea = area.toLowerCase().trim();
  const locationData = KENYA_LOCATIONS[normalizedArea];

  if (!locationData) return null;

  // Check if declared sub-county matches actual sub-county
  if (locationData.subCounty.toLowerCase() !== subCounty.toLowerCase()) {
    return {
      hasConflict: true,
      actualSubCounty: locationData.subCounty,
      declaredSubCounty: subCounty,
      correctPostalCode: locationData.postalCode,
      suggestedRoads: locationData.roads,
    };
  }

  return {
    hasConflict: false,
    correctPostalCode: locationData.postalCode,
    suggestedRoads: locationData.roads,
  };
}

/**
 * Generates two address format options for Kenya in standard form format
 * @param {Object} components - Address components
 * @returns {Object} Two formatted options with line-by-line breakdown
 */
export function generateKenyaAddressOptions(components) {
  const { building, street, area, city, postalCode } = components;

  // Detect location data
  const normalizedArea = area?.toLowerCase().trim();
  const locationData = KENYA_LOCATIONS[normalizedArea];

  // Get correct postal code and roads
  const roads = locationData?.suggestedRoads || [];
  const correctPostalCode = locationData?.postalCode || postalCode || "00100";
  const correctSubCounty = locationData?.subCounty || area;
  const roadName = street || roads[0] || "Main Road";

  // Option A: Precise format (road-based)
  const optionA = {
    label: "Precise Format",
    recommended: true,
    description: "Best if you live near the main road",
    lines: {
      line1: roadName,
      line2: area || correctSubCounty,
      city: city || "Nairobi",
      postalCode: correctPostalCode,
      country: "Kenya",
    },
  };

  // Option B: Building-based format
  const optionB = {
    label: "Building Format",
    recommended: false,
    description: "Best if your building has a known name",
    lines: {
      line1: `${building || "Plot 45"}, ${roadName}`,
      line2: area || correctSubCounty,
      city: city || "Nairobi",
      postalCode: correctPostalCode,
      country: "Kenya",
    },
  };

  return { optionA, optionB };
}

/**
 * Analyzes address issues and provides fixes
 * @param {Object} components - Address components
 * @returns {Array} Array of detected issues with fixes
 */
export function analyzeAddressIssues(components) {
  const issues = [];
  const { building, area, state, city, postalCode } = components;

  // Check 1: Location conflict
  if (area && state) {
    const conflict = detectLocationConflict(area, state);
    if (conflict?.hasConflict) {
      issues.push({
        type: "CONFLICT",
        severity: "error",
        message: `You said "${area}" (which is in ${conflict.actualSubCounty}) but listed "${conflict.declaredSubCounty}". Google will reject this mismatch.`,
        fix: `Change sub-county to "${conflict.actualSubCounty}" and postal code to "${conflict.correctPostalCode}"`,
      });
    }
  }

  // Check 2: Religious landmarks
  const religiousKeywords = [
    "mosque",
    "church",
    "temple",
    "cathedral",
    "shrine",
  ];
  if (
    building &&
    religiousKeywords.some((kw) => building.toLowerCase().includes(kw))
  ) {
    issues.push({
      type: "FORBIDDEN_KEYWORD",
      severity: "error",
      message:
        'Building name contains religious landmark. Google prefers "Plot" or "Road".',
      fix: 'Remove the religious reference or replace with "Building" or a plot number',
    });
  }

  // Check 3: Vague terms
  const vagueTerms = [
    "westside",
    "eastside",
    "northside",
    "southside",
    "near",
    "opposite",
  ];
  if (
    [building, area].some(
      (field) =>
        field && vagueTerms.some((term) => field.toLowerCase().includes(term))
    )
  ) {
    issues.push({
      type: "VAGUE_TERM",
      severity: "warning",
      message: "Address contains vague directional term. It confuses GPS.",
      fix: 'Remove vague terms like "westside" or "near"',
    });
  }

  // Check 4: Redundancy
  if (city && state && state.toLowerCase().includes(city.toLowerCase())) {
    issues.push({
      type: "REDUNDANCY",
      severity: "warning",
      message: `"${city}, ${state}" is repetitive.`,
      fix: `Remove "${state}" and keep only "${city}"`,
    });
  }

  // Check 5: Wrong postal code
  const normalizedArea = area?.toLowerCase().trim();
  const locationData = KENYA_LOCATIONS[normalizedArea];
  if (locationData && postalCode !== locationData.postalCode) {
    issues.push({
      type: "WRONG_POSTAL_CODE",
      severity: "warning",
      message: `Postal code ${postalCode} is incorrect for ${area}. Should be ${locationData.postalCode}.`,
      fix: `Change postal code to ${locationData.postalCode}`,
    });
  }

  return issues;
}
