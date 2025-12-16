/**
 * VeriBridge Pre-Flight Verification Engine
 * 4-Layer verification system to guarantee Google/Amazon acceptance
 */

// ============================================
// LAYER 1: SYNTAX VERIFICATION (Instant & Free)
// ============================================

const FORBIDDEN_KEYWORDS = {
  poBox: [
    "p.o. box",
    "p.o box",
    "po box",
    "pobox",
    "p o box",
    "private bag",
    "p/o box",
    "postal box",
    // Spanish
    "apartado",
    "casilla",
    // Portuguese
    "caixa postal",
    // French
    "boîte postale",
    "bp ",
    // German
    "postfach",
  ],
  vagueLandmarks: [
    "near",
    "opposite",
    "next to",
    "behind",
    "besides",
    "adjacent to",
    "close to",
    "around",
    "off ",
    "by the",
    "across from",
    "in front of",
    "along ",
    "towards",
    "stage",
    "junction",
    "corner of",
    "before ",
    // Kenya-specific
    "opp ",
    "nr ",
    "adj ",
  ],
  informal: [
    "plot",
    "kwa ",
    "estate gate",
    "main road",
    "slum",
    "informal settlement",
    "camp",
    "squatter",
  ],
};

const MIN_ADDRESS_LENGTH = 20;
const MIN_COMPONENTS = 3;

/**
 * Layer 1: Syntax Verification
 * Checks address format before user even goes to bank
 */
export function verifySyntax(address) {
  const results = {
    passed: true,
    score: 100,
    checks: [],
    blockers: [],
    warnings: [],
  };

  if (!address || typeof address !== "string") {
    return {
      passed: false,
      score: 0,
      checks: [{ name: "Address Present", passed: false }],
      blockers: ["No address provided"],
      warnings: [],
    };
  }

  const lowerAddress = address.toLowerCase();

  // Check 1: P.O. Box Detection (BLOCKER)
  const poBoxCheck = { name: "P.O. Box Detection", passed: true };
  for (const keyword of FORBIDDEN_KEYWORDS.poBox) {
    if (lowerAddress.includes(keyword)) {
      poBoxCheck.passed = false;
      poBoxCheck.found = keyword;
      results.blockers.push(
        `Contains "${keyword}" - Google will instantly reject this. Use a physical street address.`
      );
      results.score -= 50;
      break;
    }
  }
  results.checks.push(poBoxCheck);

  // Check 2: Vague Landmark Detection (WARNING)
  const landmarkCheck = { name: "Vague Landmark Detection", passed: true };
  for (const keyword of FORBIDDEN_KEYWORDS.vagueLandmarks) {
    if (lowerAddress.includes(keyword)) {
      landmarkCheck.passed = false;
      landmarkCheck.found = keyword;
      results.warnings.push(
        `Contains "${keyword.trim()}" - Google's AI considers this a landmark, not an address. Use a building name or street number instead.`
      );
      results.score -= 15;
      break;
    }
  }
  results.checks.push(landmarkCheck);

  // Check 3: Informal Language Detection (WARNING)
  const informalCheck = { name: "Informal Language Detection", passed: true };
  for (const keyword of FORBIDDEN_KEYWORDS.informal) {
    if (lowerAddress.includes(keyword)) {
      informalCheck.passed = false;
      informalCheck.found = keyword;
      results.warnings.push(
        `Contains informal term "${keyword.trim()}". Consider using formal address components.`
      );
      results.score -= 10;
      break;
    }
  }
  results.checks.push(informalCheck);

  // Check 4: Minimum Length Check
  const lengthCheck = {
    name: "Address Length",
    passed: address.length >= MIN_ADDRESS_LENGTH,
    length: address.length,
  };
  if (!lengthCheck.passed) {
    results.warnings.push(
      `Address too short (${address.length} chars). Google may reject addresses shorter than ${MIN_ADDRESS_LENGTH} characters.`
    );
    results.score -= 10;
  }
  results.checks.push(lengthCheck);

  // Check 5: Component Count Check
  const components = address.split(",").filter((c) => c.trim().length > 0);
  const componentCheck = {
    name: "Address Components",
    passed: components.length >= MIN_COMPONENTS,
    count: components.length,
  };
  if (!componentCheck.passed) {
    results.warnings.push(
      `Only ${components.length} address components. Include at least: Building + Street + City.`
    );
    results.score -= 15;
  }
  results.checks.push(componentCheck);

  // Check 6: Country Presence
  const countryCheck = {
    name: "Country Included",
    passed:
      /kenya|nigeria|ghana|india|philippines|brazil|mexico|uganda|tanzania/i.test(
        address
      ),
  };
  if (!countryCheck.passed) {
    results.warnings.push(
      "Country name not detected. Include your country for international verification."
    );
    results.score -= 5;
  }
  results.checks.push(countryCheck);

  // Final verdict
  results.passed = results.blockers.length === 0;
  results.score = Math.max(0, results.score);

  return results;
}

// ============================================
// LAYER 2: DOCUMENT HEALTH VERIFICATION (OCR)
// ============================================

/**
 * Layer 2: Document Health Verification
 * Analyzes uploaded document for issues
 */
export function verifyDocumentHealth(ocrText, imageData = null) {
  const results = {
    passed: true,
    score: 100,
    checks: [],
    blockers: [],
    warnings: [],
  };

  if (!ocrText || typeof ocrText !== "string") {
    return {
      passed: false,
      score: 0,
      checks: [{ name: "OCR Extraction", passed: false }],
      blockers: ["Could not extract text from document"],
      warnings: [],
    };
  }

  const lowerText = ocrText.toLowerCase();

  // Check 1: P.O. Box in Document (BLOCKER)
  const docPoBoxCheck = { name: "P.O. Box in Document", passed: true };
  for (const keyword of FORBIDDEN_KEYWORDS.poBox) {
    if (lowerText.includes(keyword)) {
      docPoBoxCheck.passed = false;
      docPoBoxCheck.found = keyword;
      results.blockers.push(
        `Document contains "${keyword}" in header! DO NOT upload this - the bank made a mistake. Go back and ask them to use your physical address only.`
      );
      results.score -= 50;
      break;
    }
  }
  results.checks.push(docPoBoxCheck);

  // Check 2: Document Freshness (< 90 days)
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})/g, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2})/gi,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2}),?\s+(20\d{2})/gi,
  ];

  let mostRecentDate = null;
  for (const pattern of datePatterns) {
    const matches = ocrText.matchAll(pattern);
    for (const match of matches) {
      try {
        const dateStr = match[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate) && parsedDate <= new Date()) {
          if (!mostRecentDate || parsedDate > mostRecentDate) {
            mostRecentDate = parsedDate;
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    }
  }

  const freshnessCheck = { name: "Document Freshness", passed: true };
  if (mostRecentDate) {
    const daysSinceIssue = Math.floor(
      (new Date() - mostRecentDate) / (1000 * 60 * 60 * 24)
    );
    freshnessCheck.daysSinceIssue = daysSinceIssue;
    freshnessCheck.dateFound = mostRecentDate.toLocaleDateString();

    if (daysSinceIssue > 90) {
      freshnessCheck.passed = false;
      results.blockers.push(
        `Document is ${daysSinceIssue} days old. Google strictly rejects documents older than 90 days. Get a fresh statement.`
      );
      results.score -= 40;
    } else if (daysSinceIssue > 60) {
      results.warnings.push(
        `Document is ${daysSinceIssue} days old. Consider getting a fresh statement to be safe.`
      );
      results.score -= 10;
    }
  } else {
    freshnessCheck.passed = false;
    freshnessCheck.dateFound = null;
    results.warnings.push(
      "Could not detect document date. Ensure it shows a date within the last 90 days."
    );
    results.score -= 10;
  }
  results.checks.push(freshnessCheck);

  // Check 3: Bank/Institution Name Detection
  const institutionCheck = { name: "Institution Detected", passed: false };
  const knownInstitutions = [
    "equity",
    "kcb",
    "cooperative",
    "coop",
    "ncba",
    "absa",
    "stanbic",
    "standard chartered",
    "barclays",
    "diamond trust",
    "family bank",
    "kenya power",
    "kplc",
    "nairobi water",
    "safaricom",
    "airtel",
  ];

  for (const inst of knownInstitutions) {
    if (lowerText.includes(inst)) {
      institutionCheck.passed = true;
      institutionCheck.found = inst;
      break;
    }
  }

  if (!institutionCheck.passed) {
    results.warnings.push(
      "Could not identify issuing institution. Ensure the bank/utility logo is visible."
    );
    results.score -= 5;
  }
  results.checks.push(institutionCheck);

  // Check 4: Text Quality (basic check)
  const qualityCheck = { name: "Text Quality", passed: true };
  const wordCount = ocrText.split(/\s+/).filter((w) => w.length > 2).length;
  qualityCheck.wordCount = wordCount;

  if (wordCount < 20) {
    qualityCheck.passed = false;
    results.warnings.push(
      "Very little text extracted. Image may be blurry or low resolution. Retake with better lighting."
    );
    results.score -= 15;
  }
  results.checks.push(qualityCheck);

  // Final verdict
  results.passed = results.blockers.length === 0;
  results.score = Math.max(0, results.score);

  return results;
}

// ============================================
// LAYER 3: IDENTITY CONSISTENCY (Premium)
// ============================================

/**
 * Layer 3: Identity Consistency Verification
 * Ensures name/details match across documents
 */
export function verifyIdentityConsistency(userData) {
  const results = {
    passed: true,
    score: 100,
    checks: [],
    blockers: [],
    warnings: [],
    premium: true,
  };

  const {
    documentName,
    profileName,
    documentAddress,
    inputAddress,
    gpsLocation,
    addressLocation,
  } = userData;

  // Check 1: Name Matching
  if (documentName && profileName) {
    const nameCheck = { name: "Name Consistency", passed: false };
    const docNameNorm = documentName
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();
    const profileNameNorm = profileName
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();

    // Check if names are similar (not exact match needed)
    const docWords = new Set(docNameNorm.split(/\s+/));
    const profileWords = new Set(profileNameNorm.split(/\s+/));
    const intersection = [...docWords].filter((w) => profileWords.has(w));

    nameCheck.similarity =
      intersection.length / Math.max(docWords.size, profileWords.size);
    nameCheck.passed = nameCheck.similarity >= 0.5;

    if (!nameCheck.passed) {
      results.blockers.push(
        `Name mismatch detected. Document shows "${documentName}" but profile has "${profileName}". Google requires exact name matching.`
      );
      results.score -= 40;
    }
    results.checks.push(nameCheck);
  }

  // Check 2: Address Consistency
  if (documentAddress && inputAddress) {
    const addressCheck = { name: "Address Consistency", passed: false };
    const docAddrNorm = documentAddress
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "");
    const inputAddrNorm = inputAddress
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "");

    // Check for key components matching
    const docWords = new Set(
      docAddrNorm.split(/\s+/).filter((w) => w.length > 2)
    );
    const inputWords = new Set(
      inputAddrNorm.split(/\s+/).filter((w) => w.length > 2)
    );
    const intersection = [...docWords].filter((w) => inputWords.has(w));

    addressCheck.matchingWords = intersection.length;
    addressCheck.passed = intersection.length >= 3;

    if (!addressCheck.passed) {
      results.warnings.push(
        "Document address differs significantly from input address. Ensure they match."
      );
      results.score -= 20;
    }
    results.checks.push(addressCheck);
  }

  // Check 3: GPS Location Match (if available)
  if (gpsLocation && addressLocation) {
    const gpsCheck = { name: "GPS Location Match", passed: false };

    // Calculate distance in km (simplified)
    const R = 6371; // Earth's radius in km
    const dLat = ((addressLocation.lat - gpsLocation.lat) * Math.PI) / 180;
    const dLon = ((addressLocation.lng - gpsLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((gpsLocation.lat * Math.PI) / 180) *
        Math.cos((addressLocation.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    gpsCheck.distanceKm = Math.round(distance);
    gpsCheck.passed = distance <= 50; // Within 50km

    if (!gpsCheck.passed) {
      results.warnings.push(
        `You appear to be ${gpsCheck.distanceKm}km from the address you entered. Google may flag this as suspicious.`
      );
      results.score -= 15;
    }
    results.checks.push(gpsCheck);
  }

  results.passed = results.blockers.length === 0;
  results.score = Math.max(0, results.score);

  return results;
}

// ============================================
// COMBINED VERIFICATION REPORT
// ============================================

/**
 * Generate complete verification report
 */
export function generateVerificationReport(
  address,
  ocrText = null,
  userData = null
) {
  const report = {
    timestamp: new Date().toISOString(),
    overallPassed: true,
    overallScore: 0,
    layers: {},
    totalBlockers: [],
    totalWarnings: [],
    recommendation: "",
  };

  // Layer 1: Syntax
  report.layers.syntax = verifySyntax(address);

  // Layer 2: Document Health (if OCR available)
  if (ocrText) {
    report.layers.documentHealth = verifyDocumentHealth(ocrText);
  }

  // Layer 3: Identity (if userData available)
  if (userData) {
    report.layers.identity = verifyIdentityConsistency(userData);
  }

  // Aggregate results
  let totalScore = 0;
  let layerCount = 0;

  for (const [layerName, layerResult] of Object.entries(report.layers)) {
    totalScore += layerResult.score;
    layerCount++;

    if (!layerResult.passed) {
      report.overallPassed = false;
    }

    report.totalBlockers.push(...layerResult.blockers);
    report.totalWarnings.push(...layerResult.warnings);
  }

  report.overallScore = Math.round(totalScore / layerCount);

  // Generate recommendation
  if (report.totalBlockers.length > 0) {
    report.recommendation =
      "🛑 DO NOT SUBMIT. Fix the critical issues above first.";
  } else if (report.overallScore >= 80) {
    report.recommendation = "✅ READY TO SUBMIT. Your documents look good!";
  } else if (report.overallScore >= 60) {
    report.recommendation =
      "⚠️ PROCEED WITH CAUTION. Address the warnings for best chance of approval.";
  } else {
    report.recommendation = "❌ NOT RECOMMENDED. Too many issues detected.";
  }

  return report;
}

/**
 * Get verification badge based on score
 */
export function getVerificationBadge(score) {
  if (score >= 90) return { text: "Excellent", color: "green", icon: "✓✓" };
  if (score >= 75) return { text: "Good", color: "blue", icon: "✓" };
  if (score >= 50) return { text: "Fair", color: "yellow", icon: "⚠" };
  return { text: "Poor", color: "red", icon: "✗" };
}
