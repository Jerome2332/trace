import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  shortenAddress,
  lamportsToSol,
  formatSol,
  formatNumber,
  formatRelativeTime,
  cn,
} from '../utils'

describe('shortenAddress', () => {
  it('returns first N + ... + last N chars with default N=4', () => {
    const address = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const result = shortenAddress(address)
    expect(result).toBe('EPjF...Dt1v')
  })

  it('accepts a custom char count', () => {
    const address = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const result = shortenAddress(address, 6)
    expect(result).toBe('EPjFWd...yTDt1v')
  })
})

describe('lamportsToSol', () => {
  it('converts 1_000_000_000 lamports to 1 SOL', () => {
    expect(lamportsToSol(1_000_000_000)).toBe(1)
  })

  it('converts 0 lamports to 0 SOL', () => {
    expect(lamportsToSol(0)).toBe(0)
  })

  it('converts fractional amounts', () => {
    expect(lamportsToSol(500_000_000)).toBe(0.5)
  })
})

describe('formatSol', () => {
  it('formats with SOL suffix', () => {
    const result = formatSol(1_000_000_000)
    expect(result).toBe('1 SOL')
  })

  it('trims trailing zeros', () => {
    const result = formatSol(1_500_000_000)
    expect(result).toBe('1.5 SOL')
  })

  it('returns "0 SOL" for very small amounts', () => {
    expect(formatSol(1)).toBe('0 SOL')
  })

  it('handles negative values', () => {
    const result = formatSol(-2_000_000_000)
    expect(result).toBe('-2 SOL')
  })
})

describe('formatNumber', () => {
  it('adds commas to large numbers', () => {
    expect(formatNumber(1_000_000)).toBe('1,000,000')
  })

  it('does not add commas to small numbers', () => {
    expect(formatNumber(999)).toBe('999')
  })
})

describe('formatRelativeTime', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns seconds ago for < 60s', () => {
    const now = Math.floor(Date.now() / 1000)
    vi.spyOn(Date, 'now').mockReturnValue(now * 1000)

    expect(formatRelativeTime(now - 30)).toBe('30s ago')
  })

  it('returns minutes ago for < 3600s', () => {
    const now = Math.floor(Date.now() / 1000)
    vi.spyOn(Date, 'now').mockReturnValue(now * 1000)

    expect(formatRelativeTime(now - 120)).toBe('2m ago')
  })

  it('returns hours ago for < 86400s', () => {
    const now = Math.floor(Date.now() / 1000)
    vi.spyOn(Date, 'now').mockReturnValue(now * 1000)

    expect(formatRelativeTime(now - 7200)).toBe('2h ago')
  })

  it('returns days ago for >= 86400s', () => {
    const now = Math.floor(Date.now() / 1000)
    vi.spyOn(Date, 'now').mockReturnValue(now * 1000)

    expect(formatRelativeTime(now - 172800)).toBe('2d ago')
  })
})

describe('cn', () => {
  it('merges tailwind classes', () => {
    const result = cn('px-4 py-2', 'px-6')
    expect(result).toBe('py-2 px-6')
  })

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra')
    expect(result).toBe('base extra')
  })
})
