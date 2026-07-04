import { redis } from './redis';

export async function rateLimit(
  ip: string,
  limit = 5,
  duration = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const key = `ratelimit:${ip}`;
    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, duration);
    }

    const remaining = Math.max(0, limit - current);
    return {
      success: current <= limit,
      limit,
      remaining,
    };
  } catch (error) {
    // If Redis is not running or down in development, fall back gracefully to allow the request
    console.error("Redis rate limiter error:", error);
    return {
      success: true,
      limit,
      remaining: limit,
    };
  }
}
