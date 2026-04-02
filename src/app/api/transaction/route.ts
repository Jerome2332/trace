import { NextRequest, NextResponse } from 'next/server'
import { validateSignature } from '@/lib/signature-validator'
import { fetchTransaction, fetchEnhancedTransaction, HeliusError } from '@/lib/helius'
import { parseTransactionLogs } from '@/lib/log-parser'
import { buildCpiTree, postProcessTree, findRootFailure, flattenCpiTree } from '@/lib/cpi-tree-builder'
import { buildAccountDiffs, sortAccountDiffs } from '@/lib/account-diff-builder'
import { resolvePrograms } from '@/lib/idl-resolver'
import { getCachedTransaction, setCachedTransaction } from '@/lib/diagnosis-cache'
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

  // Check cache
  const cached = await getCachedTransaction<TraceTransaction>(sig, network)
  if (cached) {
    return NextResponse.json({ data: cached, cached: true })
  }

  try {
    // Fetch from Helius (both calls in parallel)
    const [txResult, enhanced] = await Promise.all([
      fetchTransaction(sig, network),
      fetchEnhancedTransaction(sig, network),
    ])

    const meta = txResult.meta
    const message = txResult.transaction.message
    const warnings: string[] = []

    // Parse logs
    const rawLogs = meta?.logMessages ?? []
    const parsedLogs = parseTransactionLogs(rawLogs)

    // Check for truncated logs
    const lastLog = rawLogs[rawLogs.length - 1]
    if (lastLog === 'Log truncated') {
      warnings.push('Transaction logs were truncated by the runtime. Some data may be incomplete.')
    }

    // Build CPI tree
    const accountKeys = message.accountKeys
    const cpiTree = buildCpiTree(parsedLogs, accountKeys.map(k => k.pubkey))
    postProcessTree(cpiTree)

    // Resolve program names
    const allProgramIds = flattenCpiTree(cpiTree).map(n => n.programId)
    const resolvedPrograms = await resolvePrograms(allProgramIds)

    // Apply resolved names to tree
    for (const node of flattenCpiTree(cpiTree)) {
      const resolved = resolvedPrograms.get(node.programId)
      if (resolved) {
        node.programName = resolved.name
      }
    }

    // Build account diffs
    const accountDiffs = sortAccountDiffs(
      buildAccountDiffs(
        accountKeys,
        meta?.preBalances ?? [],
        meta?.postBalances ?? [],
        meta?.preTokenBalances ?? [],
        meta?.postTokenBalances ?? []
      )
    )

    // Find failure info
    const rootFailure = findRootFailure(cpiTree)

    // Assemble TraceTransaction
    const traceTransaction: TraceTransaction = {
      signature: sig,
      network,
      status: meta?.err ? 'failed' : 'success',
      error: meta?.err ?? null,
      slot: txResult.slot,
      blockTime: txResult.blockTime ?? 0,
      fee: meta?.fee ?? 0,
      computeUnitsConsumed: meta?.computeUnitsConsumed ?? 0,
      txType: enhanced?.type,
      description: enhanced?.description,
      source: enhanced?.source,
      cpiTree,
      accountDiffs,
      rawLogs,
      parsedLogs,
      failedProgramId: rootFailure?.programId,
      failedInstructionName: rootFailure?.instructionName,
      anchorErrorCode: rootFailure?.errorCode,
      anchorErrorMessage: rootFailure?.anchorErrorName ?? rootFailure?.errorMessage,
      warnings,
      rawTransaction: txResult as unknown as Record<string, unknown>,
    }

    // Cache result
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
