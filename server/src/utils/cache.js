/**
 * Simple in-memory cache for API responses
 * Reduces database load by caching frequently accessed data
 */

const cache = new Map();
const DEFAULT_TTL = 30000; // 30 seconds default TTL

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if expired/not found
 */
export function get(key) {
  const item = cache.get(key);

  if (!item) return null;

  // Check if expired
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds (default: 30s)
 */
export function set(key, value, ttl = DEFAULT_TTL) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 */
export function del(key) {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clear() {
  cache.clear();
}

/**
 * Invalidate cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'mailbox:*')
 */
export function invalidatePattern(pattern) {
  const regex = new RegExp(pattern.replace("*", ".*"));

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Get cache stats
 * @returns {object} - Cache statistics
 */
export function stats() {
  let active = 0;
  let expired = 0;

  for (const [key, item] of cache.entries()) {
    if (Date.now() > item.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: cache.size,
    active,
    expired,
  };
}

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiresAt) {
      cache.delete(key);
    }
  }
}, 60000);

export default { get, set, del, clear, invalidatePattern, stats };
