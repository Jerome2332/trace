export interface HeliusTransactionResponse {
  jsonrpc: string
  id: number
  result: HeliusTransactionResult | null
}

export interface HeliusTransactionResult {
  slot: number
  blockTime: number | null
  meta: HeliusTransactionMeta | null
  transaction: {
    message: {
      accountKeys: HeliusAccountKey[]
      instructions: HeliusInstruction[]
    }
    signatures: string[]
  }
}

export interface HeliusTransactionMeta {
  err: Record<string, unknown> | null
  fee: number
  preBalances: number[]
  postBalances: number[]
  preTokenBalances: HeliusTokenBalance[]
  postTokenBalances: HeliusTokenBalance[]
  innerInstructions: HeliusInnerInstruction[]
  logMessages: string[] | null
  computeUnitsConsumed?: number
}

export interface HeliusAccountKey {
  pubkey: string
  writable: boolean
  signer: boolean
}

export interface HeliusInstruction {
  programId: string
  accounts: string[]
  data: string
  parsed?: {
    type: string
    info: Record<string, unknown>
  }
}

export interface HeliusInnerInstruction {
  index: number
  instructions: HeliusInstruction[]
}

export interface HeliusTokenBalance {
  accountIndex: number
  mint: string
  owner: string
  uiTokenAmount: {
    amount: string
    decimals: number
    uiAmount: number | null
    uiAmountString: string
  }
}

export interface HeliusEnhancedTransaction {
  type: string
  description: string
  source: string
  fee: number
  feePayer: string
  signature: string
  slot: number
  timestamp: number
  nativeTransfers: Array<{
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }>
  tokenTransfers: Array<{
    fromUserAccount: string
    toUserAccount: string
    fromTokenAccount: string
    toTokenAccount: string
    tokenAmount: number
    mint: string
  }>
}
