import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

function CodeBlock({ children }: { readonly children: string }) {
  return (
    <pre className="bg-[#0d0d14] rounded-lg p-4 font-mono text-sm text-text-primary overflow-x-auto ring-1 ring-white/[0.06]">
      {children}
    </pre>
  )
}

function EndpointSection({
  method,
  path,
  children,
}: {
  readonly method: string
  readonly path: string
  readonly children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
        <span className="text-accent font-mono">{method}</span>
        <span className="font-mono text-text-secondary">{path}</span>
      </h2>
      {children}
    </section>
  )
}

function ParamTable({
  rows,
}: {
  readonly rows: ReadonlyArray<{
    readonly name: string
    readonly type: string
    readonly required: boolean
    readonly description: string
  }>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-tertiary">
            <th className="pb-2 pr-4 font-medium">Parameter</th>
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">Required</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-text-primary">{row.name}</td>
              <td className="py-2 pr-4 font-mono">{row.type}</td>
              <td className="py-2 pr-4">{row.required ? 'Yes' : 'No'}</td>
              <td className="py-2">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ErrorTable({
  rows,
}: {
  readonly rows: ReadonlyArray<{
    readonly status: number
    readonly code: string
    readonly when: string
  }>
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-tertiary">
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Code</th>
            <th className="pb-2 font-medium">When</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-border/50">
              <td className="py-2 pr-4 font-mono text-text-primary">{row.status}</td>
              <td className="py-2 pr-4 font-mono">{row.code}</td>
              <td className="py-2">{row.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Page heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              API Documentation
            </h1>
            <p className="text-text-secondary">
              Trace exposes two REST endpoints. No authentication required during beta.
            </p>
          </div>

          <hr className="border-border" />

          {/* GET /api/transaction */}
          <EndpointSection method="GET" path="/api/transaction">
            <CodeBlock>{`GET /api/transaction?sig={signature}&network={network}`}</CodeBlock>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Parameters
              </h3>
              <ParamTable
                rows={[
                  {
                    name: 'sig',
                    type: 'string',
                    required: true,
                    description:
                      'Base58-encoded Solana transaction signature (87-88 chars)',
                  },
                  {
                    name: 'network',
                    type: 'string',
                    required: false,
                    description: 'mainnet (default), devnet, or testnet',
                  },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Response
              </h3>
              <p className="text-text-secondary text-sm">
                <span className="font-mono text-text-primary">200 OK</span> returns{' '}
                <span className="font-mono">{'{ data: TraceTransaction }'}</span> containing the
                CPI tree, account diffs, parsed logs, and transaction metadata.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Errors
              </h3>
              <ErrorTable
                rows={[
                  { status: 400, code: 'INVALID_SIGNATURE', when: 'Signature is not valid Base58 or wrong length' },
                  { status: 404, code: 'TX_NOT_FOUND', when: 'Transaction does not exist on the selected network' },
                  { status: 429, code: 'RATE_LIMITED', when: 'Too many requests from this IP' },
                  { status: 503, code: 'RPC_UNAVAILABLE', when: 'Upstream Solana RPC is unreachable' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Example
              </h3>
              <CodeBlock>
                {`curl "https://your-app.vercel.app/api/transaction?sig=2L61GB...&network=mainnet"`}
              </CodeBlock>
            </div>
          </EndpointSection>

          <hr className="border-border" />

          {/* POST /api/diagnose */}
          <EndpointSection method="POST" path="/api/diagnose">
            <CodeBlock>
              {`POST /api/diagnose
Content-Type: application/json

{ "signature": "...", "network": "mainnet" }`}
            </CodeBlock>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Request body
              </h3>
              <ParamTable
                rows={[
                  {
                    name: 'signature',
                    type: 'string',
                    required: true,
                    description: 'Base58-encoded transaction signature',
                  },
                  {
                    name: 'network',
                    type: 'string',
                    required: false,
                    description: 'mainnet (default), devnet, or testnet',
                  },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Response
              </h3>
              <p className="text-text-secondary text-sm">
                <span className="font-mono text-text-primary">200 OK</span> returns{' '}
                <span className="font-mono">{'{ diagnosis: Diagnosis, cached: boolean }'}</span>{' '}
                containing <span className="font-mono">rootCause</span>,{' '}
                <span className="font-mono">technicalDetail</span>,{' '}
                <span className="font-mono">suggestedFix</span>,{' '}
                <span className="font-mono">confidence</span>, and related fields.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Errors
              </h3>
              <ErrorTable
                rows={[
                  { status: 400, code: 'INVALID_REQUEST', when: 'Missing or malformed request body' },
                  { status: 404, code: 'TX_NOT_CACHED', when: 'Transaction must be fetched via /api/transaction first' },
                  { status: 429, code: 'RATE_LIMITED', when: 'Too many requests from this IP' },
                  { status: 500, code: 'AI_ERROR', when: 'Diagnosis model returned an error' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wide">
                Example
              </h3>
              <CodeBlock>
                {`curl -X POST "https://your-app.vercel.app/api/diagnose" \\
  -H "Content-Type: application/json" \\
  -d '{"signature":"2L61GB...","network":"mainnet"}'`}
              </CodeBlock>
            </div>
          </EndpointSection>

          <hr className="border-border" />

          {/* Rate Limits */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Rate Limits</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-tertiary">
                    <th className="pb-2 pr-4 font-medium">Endpoint</th>
                    <th className="pb-2 pr-4 font-medium">Guest</th>
                    <th className="pb-2 font-medium">Authenticated</th>
                  </tr>
                </thead>
                <tbody className="text-text-secondary">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-text-primary">/api/transaction</td>
                    <td className="py-2 pr-4">10/min</td>
                    <td className="py-2">60/min</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-text-primary">/api/diagnose</td>
                    <td className="py-2 pr-4">3/min</td>
                    <td className="py-2">20/min</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <hr className="border-border" />

          {/* Response Types */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Response Types</h2>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                <span className="font-mono text-text-primary">TraceTransaction</span> is the
                primary response object. It contains the transaction{' '}
                <span className="font-mono">signature</span>,{' '}
                <span className="font-mono">status</span> (success or failure),{' '}
                <span className="font-mono">cpiTree</span> (a nested array of{' '}
                <span className="font-mono">CpiTreeNode[]</span> representing cross-program
                invocations),{' '}
                <span className="font-mono">accountDiffs</span> (an array of{' '}
                <span className="font-mono">AccountDiff[]</span> showing before/after state for
                each account), <span className="font-mono">parsedLogs</span>, and AI diagnosis
                fields when available.
              </p>
              <p>
                Full type definitions are in the project source under{' '}
                <span className="font-mono">src/types/</span>. See the{' '}
                <a
                  href="https://github.com/Jerome2332/trace"
                  className="text-accent underline underline-offset-2 hover:text-accent/80"
                >
                  GitHub repository
                </a>{' '}
                for the latest schemas.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
