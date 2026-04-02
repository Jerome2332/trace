import Anthropic from '@anthropic-ai/sdk'

import type { TraceTransaction } from '@/types/transaction'
import type { Diagnosis } from '@/types/diagnosis'
import type { CpiTreeNode } from '@/types/cpi-tree'
import { findRootFailure, flattenCpiTree } from './cpi-tree-builder'

const SYSTEM_PROMPT = `You are a Solana blockchain debugging expert with deep knowledge of:
- The Anchor framework (v0.28-v0.31)
- Solana runtime behaviour and error types
- SPL Token program, Associated Token Account program, System program
- Common on-chain failure patterns (constraint violations, CPI failures, compute limits, slippage)
- Solana account model (ownership, signers, writable flags, rent exemption)

Your job is to diagnose failed Solana transactions and explain them to developers in plain English.

You will receive a structured JSON object describing a transaction trace including:
- The transaction status and error
- A CPI call tree showing which programs were invoked
- Account balance changes (before and after)
- Raw log messages from the transaction

You MUST respond with ONLY a valid JSON object -- no preamble, no markdown, no explanation outside the JSON. The JSON must exactly match this schema:

{
  "rootCause": "string (one sentence, direct, specific)",
  "technicalDetail": "string (2-3 sentences explaining the mechanism)",
  "failedProgram": "string or null",
  "failedInstruction": "string or null",
  "affectedAccount": "string or null (the specific account address or constraint name involved)",
  "errorCode": "string or null (e.g. 'ConstraintMut (2000)' or 'SlippageExceeded (0x1784)')",
  "suggestedFix": "string (concrete, actionable fix -- be specific)",
  "codeSnippet": "string or null (short Rust/Anchor code showing the fix -- only if genuinely helpful)",
  "docsUrl": "string or null (URL to relevant documentation)",
  "severity": "error" | "warning" | "info",
  "confidence": "high" | "medium" | "low"
}

Rules:
- rootCause MUST be one sentence. No hedge words like "it seems" or "possibly". Be direct.
- If the transaction SUCCEEDED, set severity to "info" and explain what happened (not what failed).
- If you cannot determine the root cause with confidence, set confidence to "low" and explain what you do know.
- Never hallucinate program names, account addresses, or error codes not present in the input.
- Keep codeSnippet under 10 lines. Do not write full programs.
- docsUrl must be a real, valid URL. Only include it if you are certain it exists.`

function truncateAddress(address: string): string {
  if (address.length <= 8) return address
  return address.slice(0, 8)
}

function summarizeCpiNode(node: CpiTreeNode): Record<string, unknown> {
  return {
    program: node.programName ?? truncateAddress(node.programId),
    instruction: node.instructionName ?? null,
    status: node.status,
    depth: node.depth,
    computeUnits: node.computeUnits ?? null,
    children: node.children.map(summarizeCpiNode),
  }
}

export function buildUserPrompt(tx: TraceTransaction): string {
  const allNodes = flattenCpiTree(tx.cpiTree)
  const failedNodes = allNodes.filter((n) => n.status === 'failed')
  const deepestFailure = findRootFailure(tx.cpiTree)

  const failedNodeSummaries = failedNodes.map((n) => ({
    programId: n.programId,
    programName: n.programName ?? null,
    depth: n.depth,
    errorCode: n.errorCode ?? null,
    errorHex: n.errorHex ?? null,
    errorMessage: n.errorMessage ?? null,
    anchorErrorName: n.anchorErrorName ?? null,
    instructionName: n.instructionName ?? null,
    rawLogsTail: n.logs.slice(-10).map((l) => l.raw),
  }))

  const deepestFailureSummary = deepestFailure
    ? {
        programId: deepestFailure.programId,
        programName: deepestFailure.programName ?? null,
        depth: deepestFailure.depth,
        errorCode: deepestFailure.errorCode ?? null,
        errorHex: deepestFailure.errorHex ?? null,
        errorMessage: deepestFailure.errorMessage ?? null,
        anchorErrorName: deepestFailure.anchorErrorName ?? null,
        instructionName: deepestFailure.instructionName ?? null,
      }
    : null

  const cpiTreeSummary = tx.cpiTree.map(summarizeCpiNode)

  const changedAccounts = tx.accountDiffs
    .filter(
      (a) =>
        a.solDelta !== 0 ||
        a.isNew ||
        a.isClosed ||
        a.tokenChanges.length > 0,
    )
    .slice(0, 10)

  const accountDiffs = changedAccounts.map((a) => ({
    address: truncateAddress(a.address),
    isNew: a.isNew,
    solDelta: a.solDelta,
    tokenChanges: a.tokenChanges.map((t) => ({
      mint: truncateAddress(t.mint),
      delta: t.uiDelta,
      decimals: t.decimals,
    })),
  }))

  const rawLogsSnippet = tx.rawLogs.slice(-20)

  const payload = {
    status: tx.status,
    network: tx.network,
    txType: tx.txType ?? null,
    description: tx.description ?? null,
    computeUnitsConsumed: tx.computeUnitsConsumed,
    error: tx.error,
    failedNodes: failedNodeSummaries,
    deepestFailure: deepestFailureSummary,
    cpiTreeSummary,
    accountDiffs,
    rawLogsSnippet,
  }

  return JSON.stringify(payload, null, 2)
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '')
}

function buildFallbackDiagnosis(errorMessage: string): Diagnosis {
  return {
    rootCause: 'Unable to determine root cause from AI analysis.',
    technicalDetail: `The AI diagnosis failed to produce a valid response. Raw error: ${errorMessage}`,
    suggestedFix:
      'Review the transaction logs manually or retry the diagnosis.',
    severity: 'error',
    confidence: 'low',
    generatedAt: new Date().toISOString(),
  }
}

export async function callClaudeDiagnosis(
  tx: TraceTransaction,
): Promise<Diagnosis> {
  const anthropic = new Anthropic()

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(tx) }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return buildFallbackDiagnosis('No text content in AI response')
    }

    const cleaned = stripMarkdownFences(textBlock.text.trim())

    try {
      const parsed = JSON.parse(cleaned) as Omit<Diagnosis, 'generatedAt'>
      return {
        ...parsed,
        generatedAt: new Date().toISOString(),
      }
    } catch (parseError) {
      return buildFallbackDiagnosis(
        `JSON parse failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (apiError) {
    return buildFallbackDiagnosis(
      `Anthropic API error: ${apiError instanceof Error ? apiError.message : String(apiError)}`,
    )
  }
}
