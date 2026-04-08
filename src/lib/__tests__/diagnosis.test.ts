import { describe, it, expect } from 'vitest'
import { buildUserPrompt } from '../diagnosis'
import type { TraceTransaction } from '@/types/transaction'
import type { CpiTreeNode } from '@/types/cpi-tree'

function makeNode(overrides: Partial<CpiTreeNode> = {}): CpiTreeNode {
  return {
    id: 'node-0',
    programId: '11111111111111111111111111111111',
    programName: 'System Program',
    programColor: '#64748b',
    depth: 1,
    status: 'success',
    logs: [],
    children: [],
    ...overrides,
  }
}

function makeTransaction(
  overrides: Partial<TraceTransaction> = {},
): TraceTransaction {
  return {
    signature: 'abc123def456',
    network: 'devnet',
    status: 'success',
    error: null,
    slot: 100_000,
    blockTime: 1_700_000_000,
    fee: 5000,
    computeUnitsConsumed: 50_000,
    cpiTree: [makeNode()],
    accountDiffs: [],
    rawLogs: ['Program 11111111111111111111111111111111 invoke [1]'],
    parsedLogs: [],
    warnings: [],
    rawTransaction: {},
    ...overrides,
  }
}

describe('buildUserPrompt', () => {
  it('returns a valid JSON string', () => {
    const result = buildUserPrompt(makeTransaction())
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('includes the status field', () => {
    const result = JSON.parse(buildUserPrompt(makeTransaction()))
    expect(result.status).toBe('success')
  })

  it('includes failedNodes array for a failed transaction', () => {
    const failedNode = makeNode({
      status: 'failed',
      errorCode: 2000,
      errorHex: '0x7d0',
      errorMessage: 'ConstraintMut',
      anchorErrorName: 'ConstraintMut',
      logs: [
        {
          index: 0,
          type: 'log',
          raw: 'Program log: AnchorError: ConstraintMut',
        },
      ],
    })

    const tx = makeTransaction({
      status: 'failed',
      error: { InstructionError: [0, { Custom: 2000 }] },
      cpiTree: [failedNode],
    })

    const result = JSON.parse(buildUserPrompt(tx))
    expect(result.failedNodes).toHaveLength(1)
    expect(result.failedNodes[0].programId).toBe(
      '11111111111111111111111111111111',
    )
    expect(result.failedNodes[0].errorCode).toBe(2000)
    expect(result.failedNodes[0].anchorErrorName).toBe('ConstraintMut')
  })

  it('includes rawLogsSnippet with last 20 lines', () => {
    const logs = Array.from({ length: 30 }, (_, i) => `Log line ${i}`)
    const tx = makeTransaction({ rawLogs: logs })

    const result = JSON.parse(buildUserPrompt(tx))
    expect(result.rawLogsSnippet).toHaveLength(20)
    expect(result.rawLogsSnippet[0]).toBe('Log line 10')
    expect(result.rawLogsSnippet[19]).toBe('Log line 29')
  })

  it('includes accountDiffs capped at 10 entries', () => {
    const diffs = Array.from({ length: 15 }, (_, i) => ({
      address: `Account${i}aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`,
      isWritable: true,
      isSigner: false,
      isFeePayer: false,
      isNew: false,
      isClosed: false,
      solDelta: i + 1,
      preBalance: 1_000_000,
      postBalance: 1_000_000 + i + 1,
      tokenChanges: [],
    }))

    const tx = makeTransaction({ accountDiffs: diffs })
    const result = JSON.parse(buildUserPrompt(tx))
    expect(result.accountDiffs.length).toBeLessThanOrEqual(10)
  })

  it('handles a successful transaction with no failedNodes', () => {
    const tx = makeTransaction({ status: 'success', error: null })
    const result = JSON.parse(buildUserPrompt(tx))

    expect(result.status).toBe('success')
    expect(result.failedNodes).toHaveLength(0)
    expect(result.deepestFailure).toBeNull()
  })
})
