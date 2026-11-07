import "server-only";

/**
 * Simple fixed-window, in-memory rate limiter for login attempts.
 * Good for a single Node process. For multiple instances, move this to Redis.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export function checkRateLimit(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    return { allowed: true, retryAfterMs: 0 };
  }
  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  return { allowed: true, retryAfterMs: 0 };
}

export function registerFailure(key: string) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
  } else {
    bucket.count += 1;
  }

  // Opportunistic cleanup so the map does not grow forever.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}
