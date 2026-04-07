# Trace - Submission Description

Tenderly raised $48M building transaction debugging for EVM chains. Solana has nothing equivalent. Developers hit a failed transaction, copy the signature into Solscan, and stare at a wall of raw logs trying to figure out what went wrong. There is no visual call tree, no state diff view, no explanation of why it broke.

Trace fixes this. Paste a transaction signature, get three things instantly: a color-coded CPI call tree showing exactly which program called which, account state diffs showing what changed, and an AI-generated diagnosis explaining the root cause and how to fix it.

The platform works with any Solana program, whether built with Anchor, native Rust, or SPL. No source code upload required. Trace parses the transaction directly from the RPC response and reconstructs the execution flow from raw logs.

The parser uses 7 regex patterns to extract inner instructions and build a structured call tree. It handles edge cases that trip up simpler parsers: truncated log messages, self-CPI (programs calling themselves), and depth inconsistencies where the log output doesn't match the actual call stack. A depth-stack algorithm reconstructs the tree, assigns distinct colors per program, and propagates failure status up through parent calls so you can see at a glance where things went wrong.

Account diffs come from preBalances and postBalances in the transaction response. No archive RPC node needed. 19 known Solana programs (System, Token, Associated Token Account, Metaplex, and others) are resolved to human-readable names instead of raw public keys.

The AI diagnosis sends a structured representation of the transaction to Claude Sonnet and returns JSON with three fields: root cause, technical detail, and suggested fix. This turns a 30-minute debugging session into a 30-second one.

Trace is API-first. Two public REST endpoints (/api/transaction for parsed data, /api/diagnose for AI analysis) let developers integrate debugging into their own tools and CI pipelines. Results are cached in Upstash Redis with a 24-hour TTL to keep response times fast and RPC costs low.

The target market is the 3,000 to 5,000 monthly active Solana developers tracked by Electric Capital, a number growing over 40% year-over-year. The business model is straightforward: a free web UI drives adoption, and paid API tiers (rate limits, batch processing, webhook alerts) generate revenue post-hackathon.

The codebase is open-source under MIT, built with Next.js 16, TypeScript in strict mode, Tailwind CSS v4, and Framer Motion for the UI. The test suite has 28 tests covering the parser, tree builder, and API layer.

The roadmap has three milestones: v1.1 adds an Anchor CLI plugin so developers can debug without leaving the terminal, v1.2 adds team workspaces with shared transaction history, and v2.0 introduces real-time monitoring that alerts when specific programs fail in production.

## Technical Description

Trace is a Next.js 16 application written in TypeScript (strict mode) that parses Solana transaction data into structured debugging views. The core engine has three components: a log parser using 7 regex patterns to extract inner instructions from raw transaction logs, a CPI tree builder using a depth-stack algorithm that handles self-CPI and depth inconsistencies, and an account diff calculator using preBalances/postBalances from the RPC response.

The parser resolves 19 known program addresses to human-readable names and assigns per-program colors for the visual call tree. Failure states propagate upward through the tree so parent nodes reflect child failures.

AI diagnosis sends structured transaction data to Claude Sonnet via the Anthropic API, returning typed JSON (root cause, technical detail, suggested fix). Results are cached in Upstash Redis (24h TTL).

The API exposes two REST endpoints: GET /api/transaction?sig={signature} returns the parsed tree and diffs, GET /api/diagnose?sig={signature} returns the AI analysis. Both are stateless and cacheable.

The frontend uses Tailwind CSS v4 and Framer Motion for animated tree expansion and state transitions. The test suite (Vitest, 28 tests) covers parser edge cases, tree construction, and API response contracts.

## Team

Solo developer. Jerome (GitHub: Jerome2332). Full-stack TypeScript engineer building developer tools for Solana.
