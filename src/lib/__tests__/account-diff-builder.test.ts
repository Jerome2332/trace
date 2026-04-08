import { describe, it, expect } from 'vitest'
import {
  buildAccountDiffs,
  sortAccountDiffs,
  filterChangedAccounts,
} from '../account-diff-builder'
import type { HeliusAccountKey, HeliusTokenBalance } from '@/types/helius'
import type { AccountDiff } from '@/types/account-diff'

function makeAccountKey(
  pubkey: string,
  writable = false,
  signer = false
): HeliusAccountKey {
  return { pubkey, writable, signer }
}

function makeTokenBalance(
  accountIndex: number,
  mint: string,
  owner: string,
  amount: string,
  decimals: number
): HeliusTokenBalance {
  return {
    accountIndex,
    mint,
    owner,
    uiTokenAmount: {
      amount,
      decimals,
      uiAmount: null,
      uiAmountString: '',
    },
  }
}

describe('buildAccountDiffs', () => {
  it('returns empty array when given empty inputs', () => {
    const result = buildAccountDiffs([], [], [], [], [])
    expect(result).toEqual([])
  })

  it('calculates SOL delta as post - pre', () => {
    const keys = [makeAccountKey('Abc123', true, true)]
    const result = buildAccountDiffs(keys, [5_000_000_000], [3_000_000_000], [], [])

    expect(result).toHaveLength(1)
    expect(result[0].solDelta).toBe(-2_000_000_000)
    expect(result[0].preBalance).toBe(5_000_000_000)
    expect(result[0].postBalance).toBe(3_000_000_000)
  })

  it('detects isNew when pre=0 and post>0', () => {
    const keys = [makeAccountKey('NewAccount')]
    const result = buildAccountDiffs(keys, [0], [1_000_000_000], [], [])

    expect(result[0].isNew).toBe(true)
    expect(result[0].isClosed).toBe(false)
  })

  it('detects isClosed when pre>0 and post=0', () => {
    const keys = [makeAccountKey('ClosedAccount')]
    const result = buildAccountDiffs(keys, [1_000_000_000], [0], [], [])

    expect(result[0].isClosed).toBe(true)
    expect(result[0].isNew).toBe(false)
  })

  it('sets isFeePayer to true for index 0 only', () => {
    const keys = [
      makeAccountKey('FeePayer', true, true),
      makeAccountKey('Other', true, false),
    ]
    const result = buildAccountDiffs(keys, [100, 200], [90, 200], [], [])

    expect(result[0].isFeePayer).toBe(true)
    expect(result[1].isFeePayer).toBe(false)
  })

  it('calculates token change deltas correctly', () => {
    const keys = [makeAccountKey('TokenHolder')]
    const mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

    const preTokens = [makeTokenBalance(0, mint, 'TokenHolder', '1000000', 6)]
    const postTokens = [makeTokenBalance(0, mint, 'TokenHolder', '2500000', 6)]

    const result = buildAccountDiffs(keys, [100], [100], preTokens, postTokens)

    expect(result[0].tokenChanges).toHaveLength(1)
    const change = result[0].tokenChanges[0]
    expect(change.mint).toBe(mint)
    expect(change.preAmount).toBe(1_000_000)
    expect(change.postAmount).toBe(2_500_000)
    expect(change.delta).toBe(1_500_000)
    expect(change.decimals).toBe(6)
    expect(change.uiDelta).toBeCloseTo(1.5)
  })

  it('handles token decimals in UI amounts', () => {
    const keys = [makeAccountKey('Holder')]
    const mint = 'So11111111111111111111111111111111111111112'

    const preTokens = [makeTokenBalance(0, mint, 'Holder', '1000000000', 9)]
    const postTokens = [makeTokenBalance(0, mint, 'Holder', '2000000000', 9)]

    const result = buildAccountDiffs(keys, [0], [0], preTokens, postTokens)

    const change = result[0].tokenChanges[0]
    expect(change.uiPreAmount).toBeCloseTo(1.0)
    expect(change.uiPostAmount).toBeCloseTo(2.0)
    expect(change.uiDelta).toBeCloseTo(1.0)
  })

  it('only includes tokens that actually changed', () => {
    const keys = [makeAccountKey('Holder')]
    const mintA = 'MintAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    const mintB = 'MintBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'

    const preTokens = [
      makeTokenBalance(0, mintA, 'Holder', '100', 6),
      makeTokenBalance(0, mintB, 'Holder', '500', 6),
    ]
    const postTokens = [
      makeTokenBalance(0, mintA, 'Holder', '100', 6),
      makeTokenBalance(0, mintB, 'Holder', '900', 6),
    ]

    const result = buildAccountDiffs(keys, [0], [0], preTokens, postTokens)

    expect(result[0].tokenChanges).toHaveLength(1)
    expect(result[0].tokenChanges[0].mint).toBe(mintB)
  })
})

describe('sortAccountDiffs', () => {
  function makeDiff(overrides: Partial<AccountDiff>): AccountDiff {
    return {
      address: 'Default',
      isWritable: false,
      isSigner: false,
      isFeePayer: false,
      isNew: false,
      isClosed: false,
      solDelta: 0,
      preBalance: 100,
      postBalance: 100,
      tokenChanges: [],
      ...overrides,
    }
  }

  it('places accounts with token changes first', () => {
    const withTokens = makeDiff({
      address: 'WithTokens',
      tokenChanges: [
        {
          mint: 'M',
          preAmount: 0,
          postAmount: 100,
          delta: 100,
          decimals: 6,
          uiPreAmount: 0,
          uiPostAmount: 0.0001,
          uiDelta: 0.0001,
          owner: 'O',
        },
      ],
    })
    const withSolDelta = makeDiff({ address: 'WithSol', solDelta: -5000 })
    const signerOnly = makeDiff({ address: 'Signer', isSigner: true })

    const sorted = sortAccountDiffs([signerOnly, withSolDelta, withTokens])

    expect(sorted[0].address).toBe('WithTokens')
    expect(sorted[1].address).toBe('WithSol')
    expect(sorted[2].address).toBe('Signer')
  })

  it('sorts by absolute SOL delta when scores are equal', () => {
    const bigDelta = makeDiff({ address: 'Big', solDelta: -10_000 })
    const smallDelta = makeDiff({ address: 'Small', solDelta: 500 })

    const sorted = sortAccountDiffs([smallDelta, bigDelta])

    expect(sorted[0].address).toBe('Big')
    expect(sorted[1].address).toBe('Small')
  })
})

describe('filterChangedAccounts', () => {
  function makeDiff(overrides: Partial<AccountDiff>): AccountDiff {
    return {
      address: 'Default',
      isWritable: false,
      isSigner: false,
      isFeePayer: false,
      isNew: false,
      isClosed: false,
      solDelta: 0,
      preBalance: 100,
      postBalance: 100,
      tokenChanges: [],
      ...overrides,
    }
  }

  it('filters out accounts with no changes', () => {
    const changed = makeDiff({ address: 'Changed', solDelta: -5000 })
    const unchanged = makeDiff({ address: 'Unchanged' })
    const newAccount = makeDiff({ address: 'New', isNew: true })

    const result = filterChangedAccounts([changed, unchanged, newAccount])

    expect(result).toHaveLength(2)
    expect(result.map(d => d.address)).toEqual(['Changed', 'New'])
  })

  it('keeps closed accounts', () => {
    const closed = makeDiff({ address: 'Closed', isClosed: true, solDelta: -100 })
    const result = filterChangedAccounts([closed])

    expect(result).toHaveLength(1)
  })

  it('keeps accounts with token changes', () => {
    const withTokens = makeDiff({
      address: 'Tokens',
      tokenChanges: [
        {
          mint: 'M',
          preAmount: 0,
          postAmount: 1,
          delta: 1,
          decimals: 0,
          uiPreAmount: 0,
          uiPostAmount: 1,
          uiDelta: 1,
          owner: 'O',
        },
      ],
    })
    const result = filterChangedAccounts([withTokens])
    expect(result).toHaveLength(1)
  })
})
