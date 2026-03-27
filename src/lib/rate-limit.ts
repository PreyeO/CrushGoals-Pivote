/**
 * Lightweight in-memory rate limiter.
 * Uses a sliding window per IP. Not suitable for multi-instance deployments
 * (use Redis for that), but covers single-server / serverless cold-start scenarios.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Returns true if the request is within limits, false if it should be blocked.
 * @param identifier - Usually the caller IP address
 * @param limit - Max allowed requests per window
 * @param windowMs - Window duration in milliseconds (default: 60s)
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart > windowMs) {
    // New window
    store.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) {
    return false; // Rate limit exceeded
  }

  entry.count++;
  return true;
}

/** Get the IP from a Next.js request (works on Edge and Node runtimes). */
export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
