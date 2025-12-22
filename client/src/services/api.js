/**
 * VeriBridge API Client
 * Frontend service for communicating with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// =====================
// VERIFICATION API
// =====================

/**
 * Create a new verification record
 */
export async function createVerification(data) {
  return apiFetch("/api/verify/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Lookup verification by ID
 */
export async function getVerification(verificationId) {
  return apiFetch(`/api/verify/${verificationId}`);
}

/**
 * Get verification certificate data
 */
export async function getVerificationCertificate(verificationId) {
  return apiFetch(`/api/verify/${verificationId}/certificate`);
}

/**
 * Get verification statistics
 */
export async function getVerificationStats() {
  return apiFetch("/api/verify/stats/summary");
}

// =====================
// PAYMENTS API
// =====================

/**
 * Initiate MPESA STK Push
 */
export async function initiatePayment(data) {
  return apiFetch("/api/payments/stk-push", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Check payment status
 */
export async function getPaymentStatus(paymentId) {
  return apiFetch(`/api/payments/${paymentId}`);
}

/**
 * Get service pricing
 */
export async function getPricing() {
  return apiFetch("/api/payments/pricing/all");
}

// =====================
// SERVICES API
// =====================

/**
 * Get all available services
 */
export async function getServices() {
  return apiFetch("/api/services");
}

/**
 * Get specific service details
 */
export async function getService(serviceId) {
  return apiFetch(`/api/services/${serviceId}`);
}

/**
 * Register interest in a service (lead capture)
 */
export async function registerServiceInterest(serviceId, data) {
  return apiFetch(`/api/services/${serviceId}/interest`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Clean address via API (B2B endpoint demo)
 */
export async function cleanAddress(address, country) {
  return apiFetch("/api/services/address-api/clean", {
    method: "POST",
    body: JSON.stringify({ address, country }),
  });
}

// =====================
// HEALTH CHECK
// =====================

/**
 * Check API health
 */
export async function checkHealth() {
  return apiFetch("/health");
}

export default {
  createVerification,
  getVerification,
  getVerificationCertificate,
  getVerificationStats,
  initiatePayment,
  getPaymentStatus,
  getPricing,
  getServices,
  getService,
  registerServiceInterest,
  cleanAddress,
  checkHealth,
};
