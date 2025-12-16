// List of countries with their codes, common address formats, and popular banks
export const COUNTRIES = [
  // Africa
  {
    code: "KE",
    name: "Kenya",
    region: "Africa",
    currency: "KES",
    postalFormat: "00000",
  },
  {
    code: "NG",
    name: "Nigeria",
    region: "Africa",
    currency: "NGN",
    postalFormat: "000000",
  },
  {
    code: "GH",
    name: "Ghana",
    region: "Africa",
    currency: "GHS",
    postalFormat: "AA-000-0000",
  },
  {
    code: "ZA",
    name: "South Africa",
    region: "Africa",
    currency: "ZAR",
    postalFormat: "0000",
  },
  {
    code: "TZ",
    name: "Tanzania",
    region: "Africa",
    currency: "TZS",
    postalFormat: "",
  },
  {
    code: "UG",
    name: "Uganda",
    region: "Africa",
    currency: "UGX",
    postalFormat: "",
  },
  {
    code: "RW",
    name: "Rwanda",
    region: "Africa",
    currency: "RWF",
    postalFormat: "",
  },
  {
    code: "ET",
    name: "Ethiopia",
    region: "Africa",
    currency: "ETB",
    postalFormat: "0000",
  },
  {
    code: "EG",
    name: "Egypt",
    region: "Africa",
    currency: "EGP",
    postalFormat: "00000",
  },

  // Asia
  {
    code: "IN",
    name: "India",
    region: "Asia",
    currency: "INR",
    postalFormat: "000000",
  },
  {
    code: "PH",
    name: "Philippines",
    region: "Asia",
    currency: "PHP",
    postalFormat: "0000",
  },
  {
    code: "ID",
    name: "Indonesia",
    region: "Asia",
    currency: "IDR",
    postalFormat: "00000",
  },
  {
    code: "PK",
    name: "Pakistan",
    region: "Asia",
    currency: "PKR",
    postalFormat: "00000",
  },
  {
    code: "BD",
    name: "Bangladesh",
    region: "Asia",
    currency: "BDT",
    postalFormat: "0000",
  },
  {
    code: "VN",
    name: "Vietnam",
    region: "Asia",
    currency: "VND",
    postalFormat: "000000",
  },
  {
    code: "TH",
    name: "Thailand",
    region: "Asia",
    currency: "THB",
    postalFormat: "00000",
  },
  {
    code: "MY",
    name: "Malaysia",
    region: "Asia",
    currency: "MYR",
    postalFormat: "00000",
  },

  // Latin America
  {
    code: "BR",
    name: "Brazil",
    region: "Latin America",
    currency: "BRL",
    postalFormat: "00000-000",
  },
  {
    code: "MX",
    name: "Mexico",
    region: "Latin America",
    currency: "MXN",
    postalFormat: "00000",
  },
  {
    code: "AR",
    name: "Argentina",
    region: "Latin America",
    currency: "ARS",
    postalFormat: "A0000AAA",
  },
  {
    code: "CO",
    name: "Colombia",
    region: "Latin America",
    currency: "COP",
    postalFormat: "000000",
  },
  {
    code: "PE",
    name: "Peru",
    region: "Latin America",
    currency: "PEN",
    postalFormat: "00000",
  },
  {
    code: "VE",
    name: "Venezuela",
    region: "Latin America",
    currency: "VES",
    postalFormat: "0000",
  },

  // Eastern Europe
  {
    code: "UA",
    name: "Ukraine",
    region: "Eastern Europe",
    currency: "UAH",
    postalFormat: "00000",
  },
  {
    code: "RO",
    name: "Romania",
    region: "Eastern Europe",
    currency: "RON",
    postalFormat: "000000",
  },
  {
    code: "PL",
    name: "Poland",
    region: "Eastern Europe",
    currency: "PLN",
    postalFormat: "00-000",
  },

  // Middle East
  {
    code: "TR",
    name: "Turkey",
    region: "Middle East",
    currency: "TRY",
    postalFormat: "00000",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    region: "Middle East",
    currency: "SAR",
    postalFormat: "00000",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    region: "Middle East",
    currency: "AED",
    postalFormat: "",
  },

  // Developed Markets (for reference)
  {
    code: "US",
    name: "United States",
    region: "North America",
    currency: "USD",
    postalFormat: "00000",
  },
  {
    code: "GB",
    name: "United Kingdom",
    region: "Europe",
    currency: "GBP",
    postalFormat: "AA00 0AA",
  },
  {
    code: "DE",
    name: "Germany",
    region: "Europe",
    currency: "EUR",
    postalFormat: "00000",
  },
  {
    code: "FR",
    name: "France",
    region: "Europe",
    currency: "EUR",
    postalFormat: "00000",
  },
  {
    code: "AU",
    name: "Australia",
    region: "Oceania",
    currency: "AUD",
    postalFormat: "0000",
  },
  {
    code: "CA",
    name: "Canada",
    region: "North America",
    currency: "CAD",
    postalFormat: "A0A 0A0",
  },
];

// Get country by code
export function getCountryByCode(code) {
  return COUNTRIES.find((c) => c.code === code);
}

// Get countries by region
export function getCountriesByRegion(region) {
  return COUNTRIES.filter((c) => c.region === region);
}

// Get all regions
export function getAllRegions() {
  return [...new Set(COUNTRIES.map((c) => c.region))];
}

// Priority countries (Global South focus)
export const PRIORITY_COUNTRIES = [
  "KE",
  "NG",
  "GH",
  "IN",
  "PH",
  "ID",
  "PK",
  "BR",
  "MX",
];

// Get priority countries first, then alphabetical
export function getCountriesSorted() {
  const priority = COUNTRIES.filter((c) => PRIORITY_COUNTRIES.includes(c.code));
  const others = COUNTRIES.filter(
    (c) => !PRIORITY_COUNTRIES.includes(c.code)
  ).sort((a, b) => a.name.localeCompare(b.name));
  return [...priority, ...others];
}
