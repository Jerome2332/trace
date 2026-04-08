import { Redis } from '@upstash/redis'
import { EXAMPLE_SIGNATURES } from './example-transactions'

type Network = 'mainnet' | 'devnet' | 'testnet'

const TX_TTL = 86400 // 24 hours
const DIAGNOSIS_TTL = 86400

let redisInstance: Redis | null | undefined = undefined

function getRedis(): Redis | null {
  if (redisInstance !== undefined) return redisInstance
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    redisInstance = null
    return null
  }
  redisInstance = new Redis({ url, token })
  return redisInstance
}

export async function getCachedTransaction<T>(
  signature: string,
  network: Network
): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const data = await redis.get<T>(`trace:tx:${signature}:${network}`)
    return data ?? null
  } catch {
    return null
  }
}

export async function setCachedTransaction<T>(
  signature: string,
  network: Network,
  data: T
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    const ttl = EXAMPLE_SIGNATURES.has(signature) ? undefined : TX_TTL
    const opts = ttl ? { ex: ttl } : {}
    await redis.set(`trace:tx:${signature}:${network}`, data, opts)
  } catch {
    // Cache write failure is non-critical
  }
}

export async function getCachedDiagnosis<T>(
  signature: string,
  network: Network
): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const data = await redis.get<T>(`trace:diagnosis:${signature}:${network}`)
    return data ?? null
  } catch {
    return null
  }
}

export async function setCachedDiagnosis<T>(
  signature: string,
  network: Network,
  data: T
): Promise<void> {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.set(`trace:diagnosis:${signature}:${network}`, data, { ex: DIAGNOSIS_TTL })
  } catch {
    // Cache write failure is non-critical
  }
}
