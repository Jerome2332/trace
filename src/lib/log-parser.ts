import type { ParsedLog, LogLineType } from '@/types/log-parser'
import { lookupAnchorError } from '@/lib/anchor-errors'

const INVOKE_RE = /^Program (\S+) invoke \[(\d+)\]$/
const SUCCESS_RE = /^Program (\S+) success$/
const FAILED_RE = /^Program (\S+) failed: (.+)$/
const PROGRAM_LOG_RE = /^Program log: (.+)$/
const PROGRAM_DATA_RE = /^Program data: (.+)$/
const CU_CONSUMED_RE = /^Program (\S+) consumed (\d+) of (\d+) compute units$/
const RETURN_DATA_RE = /^Program return: (\S+) (.+)$/

const HEX_ERROR_RE = /custom program error: (0x[0-9a-fA-F]+)/
const ANCHOR_ERROR_RE = /Error Code: (\w+)\. Error Number: (\d+)\./

function parseLine(raw: string, index: number): ParsedLog {
  if (raw === 'Log truncated') {
    return { index, type: 'unknown', message: 'Logs truncated by runtime', raw }
  }

  let match: RegExpMatchArray | null

  match = raw.match(INVOKE_RE)
  if (match) {
    return {
      index,
      type: 'invoke',
      programId: match[1]!,
      depth: parseInt(match[2]!, 10),
      raw,
    }
  }

  match = raw.match(SUCCESS_RE)
  if (match) {
    return {
      index,
      type: 'success',
      programId: match[1]!,
      raw,
    }
  }

  match = raw.match(FAILED_RE)
  if (match) {
    const result: ParsedLog = {
      index,
      type: 'failed',
      programId: match[1]!,
      message: match[2]!,
      raw,
    }

    const hexMatch = match[2]!.match(HEX_ERROR_RE)
    if (hexMatch) {
      const code = parseInt(hexMatch[1]!, 16)
      result.errorHex = hexMatch[1]!
      result.errorCode = code
      const anchorName = lookupAnchorError(code)
      if (anchorName) {
        result.anchorErrorCode = anchorName
      }
    }

    return result
  }

  match = raw.match(PROGRAM_LOG_RE)
  if (match) {
    const result: ParsedLog = {
      index,
      type: 'log',
      message: match[1]!,
      raw,
    }

    const anchorMatch = match[1]!.match(ANCHOR_ERROR_RE)
    if (anchorMatch) {
      result.anchorErrorCode = anchorMatch[1]!
      result.errorCode = parseInt(anchorMatch[2]!, 10)
    }

    return result
  }

  match = raw.match(PROGRAM_DATA_RE)
  if (match) {
    return {
      index,
      type: 'data',
      message: match[1]!,
      raw,
    }
  }

  match = raw.match(CU_CONSUMED_RE)
  if (match) {
    return {
      index,
      type: 'cu_consumed',
      programId: match[1]!,
      computeUnits: parseInt(match[2]!, 10),
      computeUnitsAvailable: parseInt(match[3]!, 10),
      raw,
    }
  }

  match = raw.match(RETURN_DATA_RE)
  if (match) {
    return {
      index,
      type: 'return',
      programId: match[1]!,
      returnData: match[2]!,
      raw,
    }
  }

  return {
    index,
    type: 'unknown',
    message: raw,
    raw,
  }
}

export function parseTransactionLogs(logMessages: string[]): ParsedLog[] {
  return logMessages.map((line, index) => parseLine(line, index))
}
