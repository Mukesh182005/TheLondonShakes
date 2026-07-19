const memoryLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(
  ip: string,
  limit = 5,
  duration = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  // In-memory rate limiting (completely free, zero database dependency)
  const now = Date.now();
  const key = `ratelimit:${ip}`;
  const record = memoryLimitStore.get(key);

  if (!record || now > record.resetAt) {
    memoryLimitStore.set(key, {
      count: 1,
      resetAt: now + duration * 1000,
    });
    return {
      success: true,
      limit,
      remaining: limit - 1,
    };
  }

  record.count++;
  const remaining = Math.max(0, limit - record.count);
  return {
    success: record.count <= limit,
    limit,
    remaining,
  };
}

