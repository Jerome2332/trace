import type { CpiTreeNode } from './cpi-tree'
import type { AccountDiff } from './account-diff'
import type { ParsedLog } from './log-parser'

export interface TraceTransaction {
  signature: string
  network: 'mainnet' | 'devnet' | 'testnet'
  status: 'success' | 'failed'
  error: Record<string, unknown> | null
  slot: number
  blockTime: number
  fee: number
  computeUnitsConsumed: number
  computeUnitsRequested?: number
  txType?: string
  description?: string
  source?: string
  cpiTree: CpiTreeNode[]
  accountDiffs: AccountDiff[]
  rawLogs: string[]
  parsedLogs: ParsedLog[]
  failedProgramId?: string
  failedInstructionName?: string
  anchorErrorCode?: number
  anchorErrorMessage?: string
  warnings: string[]
  rawTransaction: Record<string, unknown>
}

// Re-export related types for convenience
export type { CpiTreeNode } from './cpi-tree'
export type { AccountDiff, TokenDiff } from './account-diff'
export type { ParsedLog, LogLineType } from './log-parser'
