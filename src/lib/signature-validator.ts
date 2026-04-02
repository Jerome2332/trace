import bs58 from 'bs58'

export function validateSignature(sig: string): boolean {
  if (sig.length < 87 || sig.length > 88) return false
  try {
    const decoded = bs58.decode(sig)
    return decoded.length === 64
  } catch {
    return false
  }
}

export function extractSignatureFromUrl(input: string): string {
  // Handle Solscan URLs: https://solscan.io/tx/SIGNATURE
  const solscanMatch = input.match(/solscan\.io\/tx\/([A-Za-z0-9]+)/)
  if (solscanMatch?.[1]) return solscanMatch[1]

  // Handle Solana Explorer URLs: https://explorer.solana.com/tx/SIGNATURE
  const explorerMatch = input.match(/explorer\.solana\.com\/tx\/([A-Za-z0-9]+)/)
  if (explorerMatch?.[1]) return explorerMatch[1]

  // Return as-is (assume it's a raw signature)
  return input.trim()
}
