import { describe, it, expect } from 'vitest'
import { parseTransactionLogs } from '../log-parser'

describe('parseTransactionLogs', () => {
  it('returns an empty array for empty input', () => {
    expect(parseTransactionLogs([])).toEqual([])
  })

  it('parses a simple successful transaction with no CPI', () => {
    const logs = [
      'Program 11111111111111111111111111111111 invoke [1]',
      'Program 11111111111111111111111111111111 success',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      type: 'invoke',
      programId: '11111111111111111111111111111111',
      depth: 1,
    })
    expect(result[1]).toMatchObject({
      type: 'success',
      programId: '11111111111111111111111111111111',
    })
  })

  it('parses a single-level CPI transaction', () => {
    const logs = [
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program log: Instruction: Swap',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [2]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc success',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 success',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(5)
    expect(result[0]).toMatchObject({
      type: 'invoke',
      programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
      depth: 1,
    })
    expect(result[1]).toMatchObject({
      type: 'log',
      message: 'Instruction: Swap',
    })
    expect(result[2]).toMatchObject({
      type: 'invoke',
      programId: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      depth: 2,
    })
    expect(result[3]).toMatchObject({
      type: 'success',
      programId: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    })
    expect(result[4]).toMatchObject({
      type: 'success',
      programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    })
  })

  it('parses deep CPI with 3 levels', () => {
    const logs = [
      'Program A invoke [1]',
      'Program B invoke [2]',
      'Program C invoke [3]',
      'Program C success',
      'Program B success',
      'Program A success',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(6)
    expect(result[0]).toMatchObject({ type: 'invoke', programId: 'A', depth: 1 })
    expect(result[1]).toMatchObject({ type: 'invoke', programId: 'B', depth: 2 })
    expect(result[2]).toMatchObject({ type: 'invoke', programId: 'C', depth: 3 })
    expect(result[3]).toMatchObject({ type: 'success', programId: 'C' })
    expect(result[4]).toMatchObject({ type: 'success', programId: 'B' })
    expect(result[5]).toMatchObject({ type: 'success', programId: 'A' })
  })

  it('parses a failed transaction with custom program error hex', () => {
    const logs = [
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [1]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc failed: custom program error: 0x1784',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({
      type: 'failed',
      programId: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      errorCode: 6020,
      errorHex: '0x1784',
    })
  })

  it('parses a failed transaction with Anchor error code in logs', () => {
    const logs = [
      'Program X invoke [1]',
      'Program log: AnchorError caused by account: vault. Error Code: ConstraintMut. Error Number: 2000.',
      'Program X failed: custom program error: 0x7d0',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(3)

    const logEntry = result[1]
    expect(logEntry).toMatchObject({
      type: 'log',
      anchorErrorCode: 'ConstraintMut',
      errorCode: 2000,
    })

    const failedEntry = result[2]
    expect(failedEntry).toMatchObject({
      type: 'failed',
      programId: 'X',
      errorCode: 2000,
      errorHex: '0x7d0',
      anchorErrorCode: 'ConstraintMut',
    })
  })

  it('parses CU consumed line', () => {
    const logs = [
      'Program X invoke [1]',
      'Program X consumed 45000 of 200000 compute units',
      'Program X success',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(3)
    expect(result[1]).toMatchObject({
      type: 'cu_consumed',
      programId: 'X',
      computeUnits: 45000,
      computeUnitsAvailable: 200000,
    })
  })

  it('parses program data line', () => {
    const logs = ['Program data: SGVsbG8gV29ybGQ=']
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      type: 'data',
      message: 'SGVsbG8gV29ybGQ=',
    })
  })

  it('parses program return line', () => {
    const logs = [
      'Program return: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA pQAAAAAAAAA=',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      type: 'return',
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      returnData: 'pQAAAAAAAAA=',
    })
  })

  it('handles truncated logs', () => {
    const logs = ['Program X invoke [1]', 'Log truncated']
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({
      type: 'unknown',
    })
    expect(result[1]!.message).toContain('truncated')
  })

  it('parses ComputeBudget invoke and success', () => {
    const logs = [
      'Program ComputeBudget111111111111111111111111111111 invoke [1]',
      'Program ComputeBudget111111111111111111111111111111 success',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      type: 'invoke',
      programId: 'ComputeBudget111111111111111111111111111111',
      depth: 1,
    })
    expect(result[1]).toMatchObject({
      type: 'success',
      programId: 'ComputeBudget111111111111111111111111111111',
    })
  })

  it('parses a failed transaction with non-hex runtime error', () => {
    const logs = [
      'Program X invoke [1]',
      'Program X failed: insufficient lamports 1000, need 2000',
    ]
    const result = parseTransactionLogs(logs)

    expect(result).toHaveLength(2)
    expect(result[1]).toMatchObject({
      type: 'failed',
      programId: 'X',
      message: 'insufficient lamports 1000, need 2000',
    })
    expect(result[1]!.errorCode).toBeUndefined()
    expect(result[1]!.errorHex).toBeUndefined()
  })

  it('preserves index and raw on every entry', () => {
    const logs = [
      'Program A invoke [1]',
      'Program log: hello',
      'Program A success',
    ]
    const result = parseTransactionLogs(logs)

    result.forEach((entry, i) => {
      expect(entry.index).toBe(i)
      expect(entry.raw).toBe(logs[i])
    })
  })

  describe('fixture-based tests', () => {
    it('parses Jupiter slippage failure correctly', async () => {
      const { default: logs } = await import('./fixtures/logs/jupiter-slippage.json')
      const result = parseTransactionLogs(logs)

      const failed = result.filter(r => r.type === 'failed')
      expect(failed.length).toBe(2)
      expect(failed[0]!.errorCode).toBe(6020) // 0x1784
      expect(failed[0]!.programId).toBe('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
    })

    it('parses Anchor constraint failure correctly', async () => {
      const { default: logs } = await import('./fixtures/logs/anchor-constraint.json')
      const result = parseTransactionLogs(logs)

      const anchorLog = result.find(r => r.anchorErrorCode === 'ConstraintMut')
      expect(anchorLog).toBeDefined()
      expect(anchorLog!.errorCode).toBe(2000)

      const failed = result.filter(r => r.type === 'failed')
      expect(failed.length).toBe(1)
      expect(failed[0]!.errorCode).toBe(2000) // 0x7d0
    })

    it('parses deep CPI tree (5 levels) correctly', async () => {
      const { default: logs } = await import('./fixtures/logs/deep-cpi.json')
      const result = parseTransactionLogs(logs)

      const invokes = result.filter(r => r.type === 'invoke')
      expect(invokes.length).toBe(5)
      expect(invokes[4]!.depth).toBe(5)

      const successes = result.filter(r => r.type === 'success')
      expect(successes.length).toBe(5)
    })
  })
})
