export interface AccountDiff {
  address: string
  isWritable: boolean
  isSigner: boolean
  isFeePayer: boolean
  isNew: boolean
  isClosed: boolean
  solDelta: number
  preBalance: number
  postBalance: number
  tokenChanges: TokenDiff[]
}

export interface TokenDiff {
  mint: string
  preAmount: number
  postAmount: number
  delta: number
  decimals: number
  uiPreAmount: number
  uiPostAmount: number
  uiDelta: number
  owner: string
}
