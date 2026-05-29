// Simple in-memory rate limiter for production
// For production, consider using Redis with upstash/redis for distributed rate limiting

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitStore>();

export function rateLimit({
  identifier,
  limit = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes by default
}: {
  identifier: string;
  limit?: number;
  windowMs?: number;
}): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitStore.get(identifier);

  if (!record || record.resetTime < windowStart) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  register: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  aiChat: { limit: 50, windowMs: 24 * 60 * 60 * 1000 }, // 50 messages per day
  upload: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
} as const;
