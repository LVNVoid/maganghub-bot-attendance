interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const MAX_STORE_SIZE = 1000;

function cleanupExpiredKeys(now: number): void {
  for (const [k, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(k);
    }
  }
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, maxRequests: 30 }
): RateLimitResult {
  const now = Date.now();

  if (rateLimitStore.size > MAX_STORE_SIZE) {
    cleanupExpiredKeys(now);
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + options.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}
