import { NextRequest, NextResponse } from 'next/server'

import { callClaudeDiagnosis } from '@/lib/diagnosis'
import {
  getCachedDiagnosis,
  setCachedDiagnosis,
  getCachedTransaction,
} from '@/lib/diagnosis-cache'
import { buildTraceTransaction } from '@/lib/transaction-builder'
import { checkRateLimit } from '@/lib/rate-limiter'
import type { TraceTransaction } from '@/types/transaction'
import type { Diagnosis } from '@/types/diagnosis'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  const { signature, network } = body as {
    signature?: string
    network?: string
  }

  if (
    !signature ||
    typeof signature !== 'string' ||
    !network ||
    typeof network !== 'string'
  ) {
    return NextResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: 'Missing required fields: signature, network',
      },
      { status: 400 },
    )
  }

  const validNetworks = ['mainnet', 'devnet', 'testnet'] as const
  if (!validNetworks.includes(network as (typeof validNetworks)[number])) {
    return NextResponse.json(
      {
        error: 'INVALID_REQUEST',
        message: 'Invalid network. Must be mainnet, devnet, or testnet',
      },
      { status: 400 },
    )
  }

  const net = network as 'mainnet' | 'devnet' | 'testnet'

  // Rate limit
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rateCheck = await checkRateLimit(clientIp, 'diagnosis', false)
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', message: 'Too many requests.', retryAfter: rateCheck.retryAfter },
      { status: 429 }
    )
  }

  try {
    const cachedDiagnosis = await getCachedDiagnosis<Diagnosis>(signature, net)
    if (cachedDiagnosis) {
      return NextResponse.json({ diagnosis: cachedDiagnosis, cached: true })
    }

    let tx = await getCachedTransaction<TraceTransaction>(signature, net)
    if (!tx) {
      try {
        tx = await buildTraceTransaction(signature, net)
      } catch {
        return NextResponse.json(
          { error: 'TX_NOT_CACHED', message: 'Transaction not found. Fetch it first via /api/transaction.' },
          { status: 404 },
        )
      }
    }

    const diagnosis = await callClaudeDiagnosis(tx)

    await setCachedDiagnosis(signature, net, diagnosis)

    return NextResponse.json({ diagnosis, cached: false })
  } catch (err) {
    return NextResponse.json(
      {
        error: 'AI_ERROR',
        message:
          err instanceof Error ? err.message : 'Diagnosis generation failed',
      },
      { status: 500 },
    )
  }
}
