import axios from "axios";

/**
 * Companies House API Service
 * Integrates with UK Companies House API for company name searches
 * API Docs: https://developer-specs.company-information.service.gov.uk/
 */
class CompaniesHouseService {
  constructor() {
    this.apiKey = process.env.COMPANIES_HOUSE_API_KEY;
    this.baseUrl = "https://api.company-information.service.gov.uk";

    // Debug: Show what we got
    console.log(
      "🔑 Companies House API Key loaded:",
      this.apiKey ? "✅ Present" : "❌ Missing"
    );
    console.log("   Value:", this.apiKey || "undefined");

    if (!this.apiKey) {
      console.warn(
        "⚠️  COMPANIES_HOUSE_API_KEY not set. UK name search will not work."
      );
    }
  }

  /**
   * Check if a company name is available in the UK
   * @param {string} companyName - The proposed company name
   * @returns {Promise<{available: boolean, suggestions: Array}>}
   */
  async checkNameAvailability(companyName) {
    if (!this.apiKey) {
      throw new Error("Companies House API key not configured");
    }

    try {
      const normalizedName = companyName.trim().toUpperCase();

      const response = await axios.get(`${this.baseUrl}/search/companies`, {
        params: { q: normalizedName, items_per_page: 5 },
        auth: {
          username: this.apiKey,
          password: "", // API key is used as username, password is blank
        },
        headers: {
          Accept: "application/json",
        },
      });

      // Check for exact match (case-insensitive)
      const exactMatch = response.data.items?.find(
        (item) => item.title.toUpperCase() === normalizedName
      );

      if (exactMatch) {
        // Name is taken
        return {
          available: false,
          exactMatch: {
            name: exactMatch.title,
            number: exactMatch.company_number,
            status: exactMatch.company_status,
            type: exactMatch.company_type,
          },
          suggestions: this._generateSuggestions(
            companyName,
            response.data.items
          ),
        };
      }

      // Name appears available
      return {
        available: true,
        suggestions: [],
      };
    } catch (error) {
      // 404 means no results found (name is available)
      if (error.response?.status === 404) {
        return {
          available: true,
          suggestions: [],
        };
      }

      // Log and re-throw other errors
      console.error(
        "Companies House API Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to check company name availability");
    }
  }

  /**
   * Generate alternative name suggestions
   * @private
   */
  _generateSuggestions(originalName, existingCompanies) {
    const suggestions = [];
    const baseName = originalName.replace(/\s+(ltd|limited|llc)$/i, "").trim();

    // Suggest variations
    if (suggestions.length < 3) {
      suggestions.push(`${baseName} Global Ltd`);
      suggestions.push(`${baseName} International Ltd`);
      suggestions.push(`${baseName} Solutions Ltd`);
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get company details by registration number
   * @param {string} companyNumber - UK company registration number
   */
  async getCompanyDetails(companyNumber) {
    if (!this.apiKey) {
      throw new Error("Companies House API key not configured");
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/company/${companyNumber}`,
        {
          auth: {
            username: this.apiKey,
            password: "",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching company details:", error.message);
      throw new Error("Failed to fetch company details");
    }
  }
}

const companiesHouseService = new CompaniesHouseService();
export default companiesHouseService;
