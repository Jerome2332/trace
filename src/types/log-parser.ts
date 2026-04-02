export type LogLineType =
  | 'invoke'
  | 'success'
  | 'failed'
  | 'log'
  | 'data'
  | 'cu_consumed'
  | 'return'
  | 'unknown'

export interface ParsedLog {
  index: number
  type: LogLineType
  programId?: string
  depth?: number
  message?: string
  computeUnits?: number
  computeUnitsAvailable?: number
  returnData?: string
  errorCode?: number
  errorHex?: string
  anchorErrorCode?: string
  raw: string
}
