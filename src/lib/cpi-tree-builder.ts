import type { CpiTreeNode } from '@/types/cpi-tree'
import type { ParsedLog } from '@/types/log-parser'

const KNOWN_PROGRAM_COLORS: Record<string, string> = {
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': '#9333ea',
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': '#7c3aed',
  '11111111111111111111111111111111': '#64748b',
  'ComputeBudget111111111111111111111111111111': '#94a3b8',
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': '#10b981',
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': '#06b6d4',
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': '#f59e0b',
}

const PROGRAM_COLORS = [
  '#818cf8',
  '#34d399',
  '#fb923c',
  '#a78bfa',
  '#38bdf8',
  '#4ade80',
  '#f472b6',
  '#facc15',
]

const INSTRUCTION_NAME_RE = /^Instruction: (.+)$/

export function getProgramColor(programId: string): string {
  const known = KNOWN_PROGRAM_COLORS[programId]
  if (known) {
    return known
  }

  let hash = 0
  for (let i = 0; i < programId.length; i++) {
    hash = (hash << 5) - hash + programId.charCodeAt(i)
  }
  return PROGRAM_COLORS[Math.abs(hash) % PROGRAM_COLORS.length]!
}

function findNodeInStack(
  stack: CpiTreeNode[],
  programId: string,
): CpiTreeNode | undefined {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]!.programId === programId) {
      return stack[i]!
    }
  }
  return stack.length > 0 ? stack[stack.length - 1] : undefined
}

export function buildCpiTree(
  parsedLogs: ParsedLog[],
  _accountKeys: string[],
): CpiTreeNode[] {
  const roots: CpiTreeNode[] = []
  const stack: CpiTreeNode[] = []
  let counter = 0

  for (const log of parsedLogs) {
    if (log.type === 'invoke') {
      const node: CpiTreeNode = {
        id: `node-${counter}`,
        programId: log.programId ?? '',
        depth: log.depth ?? 1,
        status: 'unknown',
        logs: [],
        children: [],
        programColor: getProgramColor(log.programId ?? ''),
      }
      counter++

      while (stack.length > 0 && stack[stack.length - 1]!.depth >= node.depth) {
        stack.pop()
      }

      if (stack.length === 0) {
        roots.push(node)
      } else {
        stack[stack.length - 1]!.children.push(node)
      }

      stack.push(node)
      continue
    }

    if (log.type === 'success') {
      const node = findNodeInStack(stack, log.programId ?? '')
      if (node) {
        node.status = 'success'
      }
      continue
    }

    if (log.type === 'failed') {
      const node = findNodeInStack(stack, log.programId ?? '')
      if (node) {
        node.status = 'failed'
        node.errorCode = log.errorCode
        node.errorHex = log.errorHex
        node.errorMessage = log.message
      }
      continue
    }

    if (log.type === 'cu_consumed') {
      const node = findNodeInStack(stack, log.programId ?? '')
      if (node) {
        node.computeUnits = log.computeUnits
        node.computeUnitsAvailable = log.computeUnitsAvailable
      }
      continue
    }

    if (stack.length > 0) {
      stack[stack.length - 1]!.logs.push(log)
    }
  }

  return roots
}

export function walkCpiTree(
  nodes: CpiTreeNode[],
  callback: (node: CpiTreeNode, parent?: CpiTreeNode) => void,
  parent?: CpiTreeNode,
): void {
  for (const node of nodes) {
    callback(node, parent)
    walkCpiTree(node.children, callback, node)
  }
}

export function flattenCpiTree(nodes: CpiTreeNode[]): CpiTreeNode[] {
  const result: CpiTreeNode[] = []
  walkCpiTree(nodes, (node) => {
    result.push(node)
  })
  return result
}

export function findRootFailure(
  nodes: CpiTreeNode[],
): CpiTreeNode | undefined {
  const allNodes = flattenCpiTree(nodes)
  const failedNodes = allNodes.filter((n) => n.status === 'failed')
  if (failedNodes.length === 0) {
    return undefined
  }

  let deepest = failedNodes[0]!
  for (const node of failedNodes) {
    if (node.depth > deepest!.depth) {
      deepest = node
    }
  }
  return deepest
}

function propagateFailedDescendant(node: CpiTreeNode): boolean {
  let hasFailed = false
  for (const child of node.children) {
    if (child.status === 'failed' || propagateFailedDescendant(child)) {
      hasFailed = true
    }
  }
  if (hasFailed) {
    node.hasFailedDescendant = true
  }
  return hasFailed
}

export function postProcessTree(roots: CpiTreeNode[]): void {
  walkCpiTree(roots, (node) => {
    if (
      node.computeUnits !== undefined &&
      node.computeUnitsAvailable !== undefined &&
      node.computeUnitsAvailable > 0
    ) {
      node.computeUnitPercentage =
        (node.computeUnits / node.computeUnitsAvailable) * 100
    }

    if (!node.instructionName) {
      for (const log of node.logs) {
        if (log.message) {
          const match = log.message.match(INSTRUCTION_NAME_RE)
          if (match) {
            node.instructionName = match[1]
            break
          }
        }
      }
    }
  })

  for (const root of roots) {
    propagateFailedDescendant(root)
  }
}
