const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * API client for Freelancer OS dashboard endpoints
 */

// Company Orders API
export const companyOrdersAPI = {
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/api/company-orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    return response.json();
  },

  async getOrder(orderId) {
    const response = await fetch(
      `${API_BASE_URL}/api/company-orders/${orderId}`
    );
    return response.json();
  },

  async listOrders() {
    const response = await fetch(`${API_BASE_URL}/api/company-orders`);
    return response.json();
  },
};

// Invoices API
export const invoicesAPI = {
  async createInvoice(invoiceData) {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    return response.json();
  },

  async getInvoice(invoiceId) {
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`);
    return response.json();
  },

  async listInvoices() {
    const response = await fetch(`${API_BASE_URL}/api/invoices`);
    return response.json();
  },
};

// Mailbox API
export const mailboxAPI = {
  async getMailboxItems(status = null) {
    const url = status
      ? `${API_BASE_URL}/api/mailbox?status=${status}`
      : `${API_BASE_URL}/api/mailbox`;
    const response = await fetch(url);
    return response.json();
  },

  async getMailItem(itemId) {
    const response = await fetch(`${API_BASE_URL}/api/mailbox/${itemId}`);
    return response.json();
  },

  async getSubscription() {
    const response = await fetch(
      `${API_BASE_URL}/api/mailbox/subscription/status`
    );
    return response.json();
  },
};

// API Keys Management
export const apiKeysAPI = {
  async generateKey(name, description) {
    const response = await fetch(`${API_BASE_URL}/api/keys/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    return response.json();
  },

  async listKeys() {
    const response = await fetch(`${API_BASE_URL}/api/keys`);
    return response.json();
  },

  async revokeKey(keyId) {
    const response = await fetch(`${API_BASE_URL}/api/keys/${keyId}/revoke`, {
      method: "DELETE",
    });
    return response.json();
  },
};

// B2B Address API (public, requires API key)
export const addressAPI = {
  async cleanAddress(rawString, apiKey) {
    const response = await fetch(`${API_BASE_URL}/api/v1/clean-address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ raw_string: rawString }),
    });
    return response.json();
  },

  async getUsage(apiKey) {
    const response = await fetch(`${API_BASE_URL}/api/v1/usage`, {
      headers: { "x-api-key": apiKey },
    });
    return response.json();
  },
};

export default {
  companyOrdersAPI,
  invoicesAPI,
  mailboxAPI,
  apiKeysAPI,
  addressAPI,
};
