import { describe, it, expect } from 'vitest'
import {
  buildCpiTree,
  getProgramColor,
  walkCpiTree,
  flattenCpiTree,
  findRootFailure,
  postProcessTree,
} from '../cpi-tree-builder'
import { parseTransactionLogs } from '../log-parser'

describe('buildCpiTree', () => {
  it('returns empty roots for empty parsedLogs', () => {
    const roots = buildCpiTree([], [])
    expect(roots).toEqual([])
  })

  it('builds a single root node with success status', () => {
    const logs = parseTransactionLogs([
      'Program 11111111111111111111111111111111 invoke [1]',
      'Program 11111111111111111111111111111111 success',
    ])
    const roots = buildCpiTree(logs, [])

    expect(roots).toHaveLength(1)
    expect(roots[0]!).toMatchObject({
      id: 'node-0',
      programId: '11111111111111111111111111111111',
      depth: 1,
      status: 'success',
    })
    expect(roots[0]!.children).toHaveLength(0)
  })

  it('builds nested CPI tree (A -> B -> C) with correct hierarchy', () => {
    const logs = parseTransactionLogs([
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program log: Instruction: Swap',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [2]',
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]',
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc success',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 success',
    ])
    const roots = buildCpiTree(logs, [])

    expect(roots).toHaveLength(1)
    expect(roots[0]!.programId).toBe(
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    )
    expect(roots[0]!.children).toHaveLength(1)

    const child = roots[0]!.children[0]!
    expect(child.programId).toBe(
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    )
    expect(child.depth).toBe(2)
    expect(child.children).toHaveLength(1)

    const grandchild = child!.children[0]!
    expect(grandchild.programId).toBe(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    )
    expect(grandchild.depth).toBe(3)
    expect(grandchild.children).toHaveLength(0)
  })

  it('marks failed inner program and propagates hasFailedDescendant', () => {
    const logs = parseTransactionLogs([
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [2]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc failed: custom program error: 0x1771',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 failed: custom program error: 0x1771',
    ])
    const roots = buildCpiTree(logs, [])

    const inner = roots[0]!.children[0]!
    expect(inner.status).toBe('failed')
    expect(inner.errorHex).toBe('0x1771')

    postProcessTree(roots)
    expect(roots[0]!.hasFailedDescendant).toBe(true)
  })

  it('attaches compute unit data to the correct node', () => {
    const logs = parseTransactionLogs([
      'Program 11111111111111111111111111111111 invoke [1]',
      'Program 11111111111111111111111111111111 consumed 5000 of 200000 compute units',
      'Program 11111111111111111111111111111111 success',
    ])
    const roots = buildCpiTree(logs, [])

    expect(roots[0]!.computeUnits).toBe(5000)
    expect(roots[0]!.computeUnitsAvailable).toBe(200000)
  })

  it('extracts instruction name from program log', () => {
    const logs = parseTransactionLogs([
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program log: Instruction: Swap',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 success',
    ])
    const roots = buildCpiTree(logs, [])
    postProcessTree(roots)

    expect(roots[0]!.instructionName).toBe('Swap')
  })
})

describe('flattenCpiTree', () => {
  it('returns all nodes in a flat array', () => {
    const logs = parseTransactionLogs([
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [2]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc success',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 success',
    ])
    const roots = buildCpiTree(logs, [])
    const flat = flattenCpiTree(roots)

    expect(flat).toHaveLength(2)
    expect(flat[0]!.programId).toBe(
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    )
    expect(flat[1]!.programId).toBe(
      'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    )
  })
})

describe('findRootFailure', () => {
  it('returns the deepest failed node', () => {
    const logs = parseTransactionLogs([
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 invoke [1]',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc invoke [2]',
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]',
      'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: insufficient funds',
      'Program whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc failed: insufficient funds',
      'Program JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4 failed: insufficient funds',
    ])
    const roots = buildCpiTree(logs, [])
    const failure = findRootFailure(roots)

    expect(failure).toBeDefined()
    expect(failure?.programId).toBe(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    )
    expect(failure?.depth).toBe(3)
  })

  it('returns undefined when no nodes have failed', () => {
    const logs = parseTransactionLogs([
      'Program 11111111111111111111111111111111 invoke [1]',
      'Program 11111111111111111111111111111111 success',
    ])
    const roots = buildCpiTree(logs, [])
    const failure = findRootFailure(roots)

    expect(failure).toBeUndefined()
  })
})

describe('getProgramColor', () => {
  it('returns deterministic colors for the same programId', () => {
    const color1 = getProgramColor('SomeRandomProgram111')
    const color2 = getProgramColor('SomeRandomProgram111')
    expect(color1).toBe(color2)
  })

  it('returns the fixed color for known programs', () => {
    expect(
      getProgramColor('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    ).toBe('#9333ea')
    expect(
      getProgramColor('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'),
    ).toBe('#10b981')
    expect(getProgramColor('11111111111111111111111111111111')).toBe('#64748b')
  })
})

describe('postProcessTree', () => {
  it('computes CU percentage when both values are present', () => {
    const logs = parseTransactionLogs([
      'Program 11111111111111111111111111111111 invoke [1]',
      'Program 11111111111111111111111111111111 consumed 50000 of 200000 compute units',
      'Program 11111111111111111111111111111111 success',
    ])
    const roots = buildCpiTree(logs, [])
    postProcessTree(roots)

    expect(roots[0]!.computeUnitPercentage).toBe(25)
  })
})
