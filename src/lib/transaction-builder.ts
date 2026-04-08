import { fetchTransaction, fetchEnhancedTransaction } from './helius'
import { parseTransactionLogs } from './log-parser'
import { buildCpiTree, postProcessTree, findRootFailure, flattenCpiTree } from './cpi-tree-builder'
import { buildAccountDiffs, sortAccountDiffs } from './account-diff-builder'
import { resolvePrograms } from './idl-resolver'
import type { TraceTransaction } from '@/types/transaction'

type Network = 'mainnet' | 'devnet' | 'testnet'

export async function buildTraceTransaction(
  signature: string,
  network: Network
): Promise<TraceTransaction> {
  const [txResult, enhanced] = await Promise.allSettled([
    fetchTransaction(signature, network),
    fetchEnhancedTransaction(signature, network),
  ])

  if (txResult.status === 'rejected') throw txResult.reason

  const tx = txResult.value
  const enhancedData = enhanced.status === 'fulfilled' ? enhanced.value : null

  const meta = tx.meta
  const message = tx.transaction.message
  const warnings: string[] = []
  const rawLogs = meta?.logMessages ?? []
  const parsedLogs = parseTransactionLogs(rawLogs)

  const lastLog = rawLogs[rawLogs.length - 1]
  if (lastLog === 'Log truncated') {
    warnings.push('Transaction logs were truncated by the runtime. Some data may be incomplete.')
  }

  const cpiTree = buildCpiTree(parsedLogs, message.accountKeys.map(k => k.pubkey))
  postProcessTree(cpiTree)

  const allNodes = flattenCpiTree(cpiTree)
  const resolvedPrograms = await resolvePrograms(allNodes.map(n => n.programId))
  for (const node of allNodes) {
    const resolved = resolvedPrograms.get(node.programId)
    if (resolved) node.programName = resolved.name
  }

  const accountDiffs = sortAccountDiffs(
    buildAccountDiffs(
      message.accountKeys,
      meta?.preBalances ?? [],
      meta?.postBalances ?? [],
      meta?.preTokenBalances ?? [],
      meta?.postTokenBalances ?? []
    )
  )

  const rootFailure = findRootFailure(cpiTree)

  return {
    signature,
    network,
    status: meta?.err ? 'failed' : 'success',
    error: meta?.err ?? null,
    slot: tx.slot,
    blockTime: tx.blockTime ?? 0,
    fee: meta?.fee ?? 0,
    computeUnitsConsumed: meta?.computeUnitsConsumed ?? 0,
    txType: enhancedData?.type,
    description: enhancedData?.description,
    source: enhancedData?.source,
    cpiTree,
    accountDiffs,
    rawLogs,
    parsedLogs,
    failedProgramId: rootFailure?.programId,
    failedInstructionName: rootFailure?.instructionName,
    anchorErrorCode: rootFailure?.errorCode,
    anchorErrorMessage: rootFailure?.anchorErrorName ?? rootFailure?.errorMessage,
    warnings,
    rawTransaction: tx as unknown as Record<string, unknown>,
  }
}
