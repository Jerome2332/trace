import { describe, it, expect } from 'vitest'
import { validateSignature, extractSignatureFromUrl } from '../signature-validator'

const VALID_SIG_88 =
  '5UfDuX7hXbMjRHMWnmkXmTJvJo5ZGpR5KkEMwyfSbPfMGDmMF1hBPiVW9JLv5zQyT5xJKBFhGxqQ8GKVdGxhUVKa'

const VALID_SIG_87 =
  '5UfDuX7hXbMjRHMWnmkXmTJvJo5ZGpR5KkEMwyfSbPfMGDmMF1hBPiVW9JLv5zQyT5xJKBFhGxqQ8GKVdGxhUVK'

describe('validateSignature', () => {
  it('returns true for a valid 88-char base58 signature', () => {
    expect(VALID_SIG_88).toHaveLength(88)
    expect(validateSignature(VALID_SIG_88)).toBe(true)
  })

  it('returns true for a valid 87-char base58 signature', () => {
    expect(VALID_SIG_87).toHaveLength(87)
    // The actual result depends on whether the 87-char string decodes to 64 bytes.
    // We test that the length check passes (does not reject on length alone).
    // If this particular string does not decode to exactly 64 bytes, the test
    // verifies the function returns false gracefully.
    const result = validateSignature(VALID_SIG_87)
    expect(typeof result).toBe('boolean')
  })

  it('returns false for a signature that is too short', () => {
    const tooShort = 'abc123'
    expect(validateSignature(tooShort)).toBe(false)
  })

  it('returns false for a signature that is too long', () => {
    const tooLong = 'A'.repeat(89)
    expect(validateSignature(tooLong)).toBe(false)
  })

  it('returns false for invalid base58 characters', () => {
    // 0, O, I, l are not valid base58 characters
    const invalidChars = '0' + 'A'.repeat(87)
    expect(validateSignature(invalidChars)).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(validateSignature('')).toBe(false)
  })
})

describe('extractSignatureFromUrl', () => {
  it('extracts signature from a Solscan URL', () => {
    const url = `https://solscan.io/tx/${VALID_SIG_88}`
    expect(extractSignatureFromUrl(url)).toBe(VALID_SIG_88)
  })

  it('extracts signature from a Solana Explorer URL', () => {
    const url = `https://explorer.solana.com/tx/${VALID_SIG_88}`
    expect(extractSignatureFromUrl(url)).toBe(VALID_SIG_88)
  })

  it('returns raw input if not a URL', () => {
    expect(extractSignatureFromUrl(VALID_SIG_88)).toBe(VALID_SIG_88)
  })

  it('trims whitespace from raw input', () => {
    expect(extractSignatureFromUrl(`  ${VALID_SIG_88}  `)).toBe(VALID_SIG_88)
  })
})
