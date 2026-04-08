import { NextRequest, NextResponse } from 'next/server'
import { validateSignature } from '@/lib/signature-validator'
import { HeliusError } from '@/lib/helius'
import { getCachedTransaction, setCachedTransaction } from '@/lib/diagnosis-cache'
import { buildTraceTransaction } from '@/lib/transaction-builder'
import { checkRateLimit } from '@/lib/rate-limiter'
import type { TraceTransaction } from '@/types/transaction'

type Network = 'mainnet' | 'devnet' | 'testnet'

const VALID_NETWORKS = new Set<Network>(['mainnet', 'devnet', 'testnet'])

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const sig = searchParams.get('sig')
  const networkParam = searchParams.get('network') ?? 'mainnet'

  if (!sig) {
    return NextResponse.json(
      { error: 'INVALID_SIGNATURE', message: 'Missing signature parameter.' },
      { status: 400 }
    )
  }

  if (!validateSignature(sig)) {
    return NextResponse.json(
      { error: 'INVALID_SIGNATURE', message: 'The provided signature is not valid.' },
      { status: 400 }
    )
  }

  if (!VALID_NETWORKS.has(networkParam as Network)) {
    return NextResponse.json(
      { error: 'INVALID_NETWORK', message: 'Network must be mainnet, devnet, or testnet.' },
      { status: 400 }
    )
  }

  const network = networkParam as Network

  // Rate limit
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateCheck = await checkRateLimit(clientIp, 'transaction', false)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many requests.', retryAfter: rateCheck.retryAfter },
      { status: 429 }
    )
  }

  // Check cache
  const cached = await getCachedTransaction<TraceTransaction>(sig, network)
  if (cached) {
    return NextResponse.json({ data: cached, cached: true })
  }

  try {
    const traceTransaction = await buildTraceTransaction(sig, network)

    await setCachedTransaction(sig, network, traceTransaction)

    return NextResponse.json({ data: traceTransaction })
  } catch (error) {
    if (error instanceof HeliusError) {
      const statusMap: Record<string, number> = {
        TX_NOT_FOUND: 404,
        TX_TOO_OLD: 404,
        RATE_LIMITED: 429,
        RPC_UNAVAILABLE: 503,
      }
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: statusMap[error.code] ?? 500 }
      )
    }

    console.error('Transaction fetch error:', error)
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
