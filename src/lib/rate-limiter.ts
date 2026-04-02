import { Redis } from '@upstash/redis'

type Action = 'transaction' | 'diagnosis'

const LIMITS: Record<Action, { guest: number; auth: number; windowSeconds: number }> = {
  transaction: { guest: 10, auth: 60, windowSeconds: 60 },
  diagnosis: { guest: 3, auth: 20, windowSeconds: 60 },
}

export async function checkRateLimit(
  identifier: string,
  action: Action,
  isAuthenticated: boolean
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // If Redis not configured, allow all (dev mode)
  if (!url || !token) return { allowed: true }

  const redis = new Redis({ url, token })
  const config = LIMITS[action]
  const limit = isAuthenticated ? config.auth : config.guest
  const key = `trace:ratelimit:${action}:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - config.windowSeconds

  try {
    // Use a sorted set for sliding window
    // Remove entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count entries in window
    const count = await redis.zcard(key)

    if (count >= limit) {
      // Get oldest entry to calculate retry time
      const oldest = await redis.zrange<string[]>(key, 0, 0)
      const retryAfter = oldest[0]
        ? Math.max(1, config.windowSeconds - (now - parseInt(oldest[0], 10)))
        : config.windowSeconds
      return { allowed: false, retryAfter }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}:${Math.random().toString(36).slice(2, 8)}` })
    await redis.expire(key, config.windowSeconds + 1)

    return { allowed: true }
  } catch {
    // On Redis error, allow the request (fail open)
    return { allowed: true }
  }
}
