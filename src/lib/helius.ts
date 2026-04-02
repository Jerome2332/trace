import type { HeliusTransactionResponse, HeliusTransactionResult, HeliusEnhancedTransaction } from '@/types/helius'

type Network = 'mainnet' | 'devnet' | 'testnet'

function getRpcUrl(network: Network): string {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) throw new Error('HELIUS_API_KEY not configured')

  const subdomain = network === 'mainnet' ? 'mainnet' : network
  return `https://${subdomain}.helius-rpc.com/?api-key=${apiKey}`
}

function getEnhancedApiUrl(): string {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) throw new Error('HELIUS_API_KEY not configured')
  return `https://api-mainnet.helius-rpc.com/v0/transactions/?api-key=${apiKey}`
}

export async function fetchTransaction(
  signature: string,
  network: Network
): Promise<HeliusTransactionResult> {
  const response = await fetch(getRpcUrl(network), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        signature,
        {
          encoding: 'jsonParsed',
          maxSupportedTransactionVersion: 0,
          commitment: 'finalized'
        }
      ]
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    if (response.status === 429) throw new HeliusError('RATE_LIMITED', 'Helius rate limit exceeded')
    throw new HeliusError('RPC_UNAVAILABLE', `Helius RPC returned ${response.status}`)
  }

  const data = await response.json() as HeliusTransactionResponse

  if (data.result === null) {
    throw new HeliusError('TX_NOT_FOUND', 'Transaction not found')
  }

  return data.result
}

export async function fetchEnhancedTransaction(
  signature: string,
  network: Network
): Promise<HeliusEnhancedTransaction | null> {
  if (network !== 'mainnet') return null // Enhanced API only works on mainnet

  try {
    const response = await fetch(getEnhancedApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [signature] }),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) return null

    const data = await response.json() as HeliusEnhancedTransaction[]
    return data[0] ?? null
  } catch {
    return null // Enhanced data is supplementary, never fail on it
  }
}

export class HeliusError extends Error {
  constructor(
    public readonly code: 'TX_NOT_FOUND' | 'TX_TOO_OLD' | 'RATE_LIMITED' | 'RPC_UNAVAILABLE',
    message: string
  ) {
    super(message)
    this.name = 'HeliusError'
  }
}
