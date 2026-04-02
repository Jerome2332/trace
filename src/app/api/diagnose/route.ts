import { NextRequest, NextResponse } from 'next/server'

import { callClaudeDiagnosis } from '@/lib/diagnosis'
import {
  getCachedDiagnosis,
  setCachedDiagnosis,
  getCachedTransaction,
} from '@/lib/diagnosis-cache'
import { fetchTransaction, fetchEnhancedTransaction } from '@/lib/helius'
import { parseTransactionLogs } from '@/lib/log-parser'
import { buildCpiTree, postProcessTree, findRootFailure, flattenCpiTree } from '@/lib/cpi-tree-builder'
import { buildAccountDiffs, sortAccountDiffs } from '@/lib/account-diff-builder'
import { resolvePrograms } from '@/lib/idl-resolver'
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

  try {
    const cachedDiagnosis = await getCachedDiagnosis<Diagnosis>(signature, net)
    if (cachedDiagnosis) {
      return NextResponse.json({ diagnosis: cachedDiagnosis, cached: true })
    }

    let tx = await getCachedTransaction<TraceTransaction>(signature, net)
    if (!tx) {
      // Fallback: fetch the transaction directly if not cached
      try {
        const [txResult, enhanced] = await Promise.all([
          fetchTransaction(signature, net),
          fetchEnhancedTransaction(signature, net),
        ])
        const meta = txResult.meta
        const message = txResult.transaction.message
        const rawLogs = meta?.logMessages ?? []
        const parsedLogs = parseTransactionLogs(rawLogs)
        const cpiTree = buildCpiTree(parsedLogs, message.accountKeys.map(k => k.pubkey))
        postProcessTree(cpiTree)
        const resolvedPrograms = await resolvePrograms(flattenCpiTree(cpiTree).map(n => n.programId))
        for (const node of flattenCpiTree(cpiTree)) {
          const resolved = resolvedPrograms.get(node.programId)
          if (resolved) node.programName = resolved.name
        }
        const accountDiffs = sortAccountDiffs(
          buildAccountDiffs(message.accountKeys, meta?.preBalances ?? [], meta?.postBalances ?? [], meta?.preTokenBalances ?? [], meta?.postTokenBalances ?? [])
        )
        const rootFailure = findRootFailure(cpiTree)
        tx = {
          signature, network: net, status: meta?.err ? 'failed' : 'success', error: meta?.err ?? null,
          slot: txResult.slot, blockTime: txResult.blockTime ?? 0, fee: meta?.fee ?? 0,
          computeUnitsConsumed: meta?.computeUnitsConsumed ?? 0,
          txType: enhanced?.type, description: enhanced?.description, source: enhanced?.source,
          cpiTree, accountDiffs, rawLogs, parsedLogs,
          failedProgramId: rootFailure?.programId, failedInstructionName: rootFailure?.instructionName,
          anchorErrorCode: rootFailure?.errorCode, anchorErrorMessage: rootFailure?.anchorErrorName ?? rootFailure?.errorMessage,
          warnings: [], rawTransaction: txResult as unknown as Record<string, unknown>,
        }
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
