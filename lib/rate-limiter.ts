/**
 * Simple rate limiter for API calls
 * Note: This uses in-memory storage which resets on server restart.
 * For production with serverless functions, consider using Vercel KV or Upstash Redis.
 */

interface RateLimitStore {
  count: number;
  resetAt: number; // timestamp when the count should reset
}

const stores: Map<string, RateLimitStore> = new Map();

/**
 * Check if rate limit has been exceeded
 * @param key - Unique identifier for the rate limit (e.g., "rentcast")
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds (default: 30 days)
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 30 * 24 * 60 * 60 * 1000 // 30 days default
): { allowed: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  let store = stores.get(key);

  // Initialize or reset if window has passed
  if (!store || now >= store.resetAt) {
    store = {
      count: 0,
      resetAt: now + windowMs,
    };
    stores.set(key, store);
  }

  const remaining = Math.max(0, limit - store.count);
  const allowed = store.count < limit;

  return {
    allowed,
    remaining,
    resetAt: new Date(store.resetAt),
  };
}

/**
 * Increment the rate limit counter
 * @param key - Unique identifier for the rate limit
 */
export function incrementRateLimit(key: string): void {
  const store = stores.get(key);
  if (store) {
    store.count++;
  }
}

/**
 * Get current rate limit status without incrementing
 * @param key - Unique identifier for the rate limit
 * @param limit - Maximum number of requests allowed
 */
export function getRateLimitStatus(
  key: string,
  limit: number
): { count: number; remaining: number; limit: number } {
  const store = stores.get(key);
  const count = store?.count ?? 0;
  return {
    count,
    remaining: Math.max(0, limit - count),
    limit,
  };
}
