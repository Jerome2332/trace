# Trace - Submission Description

When a Solana transaction fails, you get a hex code and a wall of raw logs. No call tree. No state diffs. No explanation. Every developer has spent 30 minutes reading `Program X failed: custom program error: 0x7d0` and manually tracing through CPI calls to find the root cause.

Tenderly solved this for EVM and raised $48M doing it. Solana has nothing equivalent. That's the gap Trace fills.

Trace does one thing: instant transaction understanding. Paste any signature, get the full picture in 5 seconds. A color-coded CPI call tree showing which programs called which and where it broke. Account state diffs showing exactly what changed. A log stream with visual grouping by invocation. And an AI diagnosis that names the root cause in one sentence and suggests a code fix.

These four views aren't separate features. They're four lenses on the same data. The product is comprehension, the ability to look at any Solana transaction and immediately understand what happened, whether it succeeded or failed.

The parser handles the hard cases other tools skip: truncated log messages, programs calling themselves (self-CPI), and depth inconsistencies where the runtime log output doesn't match the actual call stack. A depth-stack algorithm reconstructs the full tree, assigns distinct colors per program, and propagates failure status upward so broken call paths are visible at a glance. 27 known programs are resolved to human-readable names.

Account diffs come directly from preBalances and postBalances in the transaction response. No archive RPC node required. The AI diagnosis sends a structured representation of the transaction to Claude Sonnet and returns typed JSON: root cause, technical detail, error code, and suggested fix. What takes 30 minutes manually takes 5 seconds with Trace.

The business model is a proactiveness ladder. The free website is the entry point, developers paste a signature and get the full trace. Pro ($49/mo) adds a GitHub Action that catches failed Anchor tests and posts the AI diagnosis directly as a PR comment with suggested code fixes. Team ($199/mo) monitors your deployed program's mainnet transactions, catches user-facing failures, and auto-files GitHub Issues with grouped diagnoses and affected accounts. Each tier adds automation. Revenue grows as the customer's program grows from development to production.

The core engine is open-source under MIT. Two public REST endpoints (/api/transaction and /api/diagnose) let developers integrate Trace into their own tooling. This composability is intentional. Anchor CLI plugins, GitHub Actions, and VS Code extensions all build on the same API. The more the ecosystem integrates with Trace, the stickier it becomes.

The target market is the 3,000-5,000 monthly active Solana developers tracked by Electric Capital, growing 40%+ year-over-year. Programs are getting more complex every month. Multi-CPI transactions, token extensions, compressed state. Debugging is harder, not easier. The AI models just got accurate enough to diagnose Solana errors reliably. This window opened recently. We're building in it.

## Technical Description

Next.js 16, TypeScript (strict mode), Tailwind CSS v4, Framer Motion. Core engine: log parser (7 regex patterns handling self-CPI, truncated logs, depth inconsistencies), CPI tree builder (depth-stack algorithm with failure propagation and 27 known program names), account diff calculator (SOL + token deltas from RPC pre/post balances). AI diagnosis via Claude Sonnet, structured JSON output, cached in Upstash Redis. 28 unit tests covering parser edge cases, tree construction, and fixture-based integration tests with real mainnet transaction logs. Public API: GET /api/transaction, POST /api/diagnose. Mobile responsive with tabbed layout. OG image generation via Next.js ImageResponse.

## Team

Solo developer. Jerome (GitHub: Jerome2332). Full-stack TypeScript engineer building developer tools for Solana. CODA co-founder. 4 years Solana experience.
