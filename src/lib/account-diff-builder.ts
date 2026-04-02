import type { AccountDiff, TokenDiff } from '@/types/account-diff'
import type { HeliusTokenBalance, HeliusAccountKey } from '@/types/helius'

function parseTokenAmount(balance: HeliusTokenBalance): number {
  return parseInt(balance.uiTokenAmount.amount, 10)
}

function computeUiAmount(rawAmount: number, decimals: number): number {
  return rawAmount / Math.pow(10, decimals)
}

function buildTokenChanges(
  accountIndex: number,
  preTokenBalances: HeliusTokenBalance[],
  postTokenBalances: HeliusTokenBalance[]
): TokenDiff[] {
  const preByMint = new Map<string, HeliusTokenBalance>()
  const postByMint = new Map<string, HeliusTokenBalance>()

  for (const balance of preTokenBalances.filter(b => b.accountIndex === accountIndex)) {
    preByMint.set(balance.mint, balance)
  }
  for (const balance of postTokenBalances.filter(b => b.accountIndex === accountIndex)) {
    postByMint.set(balance.mint, balance)
  }

  const allMints = new Set([...preByMint.keys(), ...postByMint.keys()])
  const changes: TokenDiff[] = []

  for (const mint of allMints) {
    const pre = preByMint.get(mint)
    const post = postByMint.get(mint)

    const preAmount = pre ? parseTokenAmount(pre) : 0
    const postAmount = post ? parseTokenAmount(post) : 0
    const delta = postAmount - preAmount
    const decimals = post?.uiTokenAmount.decimals ?? pre?.uiTokenAmount.decimals ?? 0
    const owner = post?.owner ?? pre?.owner ?? ''

    const isAdded = pre === undefined && post !== undefined
    const isRemoved = pre !== undefined && post === undefined

    if (delta !== 0 || isAdded || isRemoved) {
      changes.push({
        mint,
        preAmount,
        postAmount,
        delta,
        decimals,
        uiPreAmount: computeUiAmount(preAmount, decimals),
        uiPostAmount: computeUiAmount(postAmount, decimals),
        uiDelta: computeUiAmount(delta, decimals),
        owner,
      })
    }
  }

  return changes
}

export function buildAccountDiffs(
  accountKeys: HeliusAccountKey[],
  preBalances: number[],
  postBalances: number[],
  preTokenBalances: HeliusTokenBalance[],
  postTokenBalances: HeliusTokenBalance[]
): AccountDiff[] {
  return accountKeys.map((key, index) => {
    const preBalance = preBalances[index] ?? 0
    const postBalance = postBalances[index] ?? 0
    const solDelta = postBalance - preBalance

    return {
      address: key.pubkey,
      isWritable: key.writable,
      isSigner: key.signer,
      isFeePayer: index === 0,
      isNew: preBalance === 0 && postBalance > 0,
      isClosed: preBalance > 0 && postBalance === 0,
      solDelta,
      preBalance,
      postBalance,
      tokenChanges: buildTokenChanges(index, preTokenBalances, postTokenBalances),
    }
  })
}

function sortScore(diff: AccountDiff): number {
  if (diff.tokenChanges.length > 0) return 4
  if (diff.solDelta !== 0) return 3
  if (diff.isSigner) return 2
  if (diff.isNew) return 1
  return 0
}

export function sortAccountDiffs(diffs: AccountDiff[]): AccountDiff[] {
  return [...diffs].sort((a, b) => {
    const scoreA = sortScore(a)
    const scoreB = sortScore(b)
    if (scoreA !== scoreB) return scoreB - scoreA
    return Math.abs(b.solDelta) - Math.abs(a.solDelta)
  })
}

export function filterChangedAccounts(diffs: AccountDiff[]): AccountDiff[] {
  return diffs.filter(
    diff => diff.solDelta !== 0 || diff.tokenChanges.length > 0 || diff.isNew || diff.isClosed
  )
}
