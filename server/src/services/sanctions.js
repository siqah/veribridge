import axios from "axios";

/**
 * Sanctions Screening Service
 * Uses OpenSanctions API for AML/KYC compliance
 * Checks individuals and entities against global sanctions lists
 */
class SanctionsService {
  constructor() {
    this.apiKey = process.env.OPENSANCTIONS_API_KEY;
    this.baseUrl = "https://api.opensanctions.org";
  }

  /**
   * Screen a person against sanctions lists
   * @param {Object} person - Person details
   * @param {string} person.fullName - Full name of the person
   * @param {string} person.country - Country code (e.g., 'KE')
   * @param {string} person.dateOfBirth - Optional date of birth
   * @returns {Promise<{isHit: boolean, matches: Array, risk: string}>}
   */
  async screenPerson(person) {
    try {
      const { fullName, country, dateOfBirth } = person;

      // For MVP, use simple name matching
      // In production, integrate with OpenSanctions or similar
      const response = await this._checkSanctionsList(fullName);

      return {
        isHit: response.isHit,
        matches: response.matches || [],
        risk: response.isHit ? "HIGH" : "LOW",
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Sanctions screening error:", error.message);

      // IMPORTANT: Fail open for MVP (don't block users if service is down)
      // In production, you should fail closed (reject if screening fails)
      return {
        isHit: false,
        matches: [],
        risk: "UNKNOWN",
        error: "Screening service unavailable",
        checkedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Check against sanctions lists
   * @private
   */
  async _checkSanctionsList(fullName) {
    // MVP Implementation: Basic check
    // TODO: Integrate with actual sanctions API

    // Known sanctions test cases (for development)
    const testSanctionsList = [
      "vladimir putin",
      "kim jong un",
      "osama bin laden",
    ];

    const normalizedName = fullName.toLowerCase().trim();
    const isHit = testSanctionsList.some((sanctioned) =>
      normalizedName.includes(sanctioned)
    );

    if (isHit) {
      return {
        isHit: true,
        matches: [
          {
            name: fullName,
            reason: "Matched sanctions list",
            source: "Test List",
          },
        ],
      };
    }

    return {
      isHit: false,
      matches: [],
    };
  }

  /**
   * Screen a company name
   * @param {string} companyName - Company name to screen
   */
  async screenCompany(companyName) {
    // Similar logic to person screening
    return this._checkSanctionsList(companyName);
  }
}

const sanctionsService = new SanctionsService();
export default sanctionsService;
