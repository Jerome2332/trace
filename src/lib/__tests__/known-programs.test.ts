import { describe, it, expect } from 'vitest'
import { KNOWN_PROGRAMS } from '../known-programs'
import { lookupAnchorError } from '../anchor-errors'

describe('KNOWN_PROGRAMS', () => {
  it('contains System Program', () => {
    const entry = KNOWN_PROGRAMS['11111111111111111111111111111111']
    expect(entry).toBeDefined()
    expect(entry!.name).toBe('System Program')
    expect(entry!.shortName).toBe('System')
    expect(entry!.category).toBe('native')
  })

  it('contains SPL Token', () => {
    const entry =
      KNOWN_PROGRAMS['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']
    expect(entry).toBeDefined()
    expect(entry!.name).toBe('SPL Token')
  })

  it('contains Jupiter v6', () => {
    const entry =
      KNOWN_PROGRAMS['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4']
    expect(entry).toBeDefined()
    expect(entry!.name).toBe('Jupiter v6')
    expect(entry!.shortName).toBe('Jupiter')
    expect(entry!.category).toBe('defi')
  })

  it('all entries have name, shortName, and category fields', () => {
    for (const [id, program] of Object.entries(KNOWN_PROGRAMS)) {
      expect(program.name, `${id} missing name`).toBeTruthy()
      expect(program.shortName, `${id} missing shortName`).toBeTruthy()
      expect(program.category, `${id} missing category`).toBeTruthy()
    }
  })

  it('has no duplicate program IDs', () => {
    const ids = Object.keys(KNOWN_PROGRAMS)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('category is one of: native, spl, defi, nft, token', () => {
    const validCategories = new Set([
      'native',
      'spl',
      'defi',
      'nft',
      'token',
    ])
    for (const [id, program] of Object.entries(KNOWN_PROGRAMS)) {
      expect(
        validCategories.has(program.category),
        `${id} has invalid category: ${program.category}`,
      ).toBe(true)
    }
  })

  it('contains exactly 27 known programs', () => {
    expect(Object.keys(KNOWN_PROGRAMS)).toHaveLength(27)
  })
})

describe('lookupAnchorError', () => {
  it('returns ConstraintMut for code 2000', () => {
    expect(lookupAnchorError(2000)).toBe('ConstraintMut')
  })

  it('returns InvalidState for code 6000', () => {
    expect(lookupAnchorError(6000)).toBe('InvalidState')
  })

  it('returns undefined for unknown code 99999', () => {
    expect(lookupAnchorError(99999)).toBeUndefined()
  })
})
