/**
 * Logger Utility
 * Provides environment-aware logging that respects NODE_ENV
 */

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = {
  /**
   * Log informational messages (only in development)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args) => {
    console.warn(...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args) => {
    console.error(...args);
  },

  /**
   * Log success messages with emoji (only in development)
   */
  success: (...args) => {
    if (isDevelopment) {
      console.log("✅", ...args);
    }
  },

  /**
   * Log API requests (only in development)
   */
  request: (method, path, userId) => {
    if (isDevelopment) {
      console.log(`📍 ${method} ${path}${userId ? ` [User: ${userId}]` : ""}`);
    }
  },

  /**
   * Log business events (always logged for analytics)
   */
  event: (eventName, data = {}) => {
    console.log(`📊 Event: ${eventName}`, JSON.stringify(data));
  },
};

export default logger;
