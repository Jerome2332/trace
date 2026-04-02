import type { ParsedLog } from './log-parser'

export interface CpiTreeNode {
  id: string
  programId: string
  programName?: string
  programColor: string
  instructionName?: string
  depth: number
  status: 'success' | 'failed' | 'unknown'
  computeUnits?: number
  computeUnitsAvailable?: number
  computeUnitPercentage?: number
  logs: ParsedLog[]
  errorCode?: number
  errorHex?: string
  errorMessage?: string
  anchorErrorName?: string
  children: CpiTreeNode[]
  hasFailedDescendant?: boolean
}
