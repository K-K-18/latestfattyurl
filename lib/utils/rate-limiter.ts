/**
 * Sliding window rate limiter with tiered limits.
 * In-memory for single-server deployments.
 * Replace with Redis-backed implementation for multi-server scaling.
 */

type RateLimitTier = "public" | "redirect" | "password" | "authenticated" | "api"

const TIER_CONFIG: Record<RateLimitTier, { windowMs: number; maxRequests: number }> = {
  public: { windowMs: 60_000, maxRequests: 30 },            // 30 req/min
  redirect: { windowMs: 60_000, maxRequests: 120 },          // 120 req/min (high traffic)
  password: { windowMs: 15 * 60_000, maxRequests: 5 },       // 5 attempts per 15 min
  authenticated: { windowMs: 60_000, maxRequests: 100 },      // 100 req/min
  api: { windowMs: 60 * 60_000, maxRequests: 1000 },         // 1000 req/hour
}

// Sliding window log: store timestamps of requests per key
const windowMap = new Map<string, number[]>()

export function checkRateLimit(
  key: string,
  tier: RateLimitTier = "api"
): { allowed: boolean; remaining: number; resetMs: number } {
  const config = TIER_CONFIG[tier]
  const now = Date.now()
  const windowStart = now - config.windowMs

  const fullKey = `${tier}:${key}`
  const timestamps = windowMap.get(fullKey) || []

  // Filter out timestamps outside the window
  const activeTimestamps = timestamps.filter((t) => t > windowStart)

  if (activeTimestamps.length >= config.maxRequests) {
    // Calculate when the oldest request in the window expires
    const oldestInWindow = activeTimestamps[0]
    const resetMs = oldestInWindow + config.windowMs - now

    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    }
  }

  // Record this request
  activeTimestamps.push(now)
  windowMap.set(fullKey, activeTimestamps)

  return {
    allowed: true,
    remaining: config.maxRequests - activeTimestamps.length,
    resetMs: config.windowMs,
  }
}

/**
 * Helper to extract client IP from request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

/**
 * Helper to create a rate limit response.
 */
export function rateLimitResponse(resetMs: number) {
  return new Response(
    JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil(resetMs / 1000)),
      },
    }
  )
}

// Clean up expired entries every 2 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of windowMap) {
    // Remove entries that are all outside any window
    const maxWindow = 60 * 60_000 // 1 hour (longest window)
    const active = timestamps.filter((t) => t > now - maxWindow)
    if (active.length === 0) {
      windowMap.delete(key)
    } else {
      windowMap.set(key, active)
    }
  }
}, 2 * 60_000)
