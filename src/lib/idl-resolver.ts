import { KNOWN_PROGRAMS } from './known-programs'
import { shortenAddress } from './utils'

interface ResolvedProgram {
  name: string
  shortName: string
}

const resolveCache = new Map<string, ResolvedProgram>()

export async function resolveProgram(programId: string): Promise<ResolvedProgram> {
  const cached = resolveCache.get(programId)
  if (cached) return cached

  // 1. Check hardcoded known programs
  const known = KNOWN_PROGRAMS[programId]
  if (known) {
    const result = { name: known.name, shortName: known.shortName }
    resolveCache.set(programId, result)
    return result
  }

  // 2. Try anchor.so IDL registry
  try {
    const response = await fetch(`https://api.anchor.so/idls/${programId}`, {
      signal: AbortSignal.timeout(2000),
    })
    if (response.ok) {
      const idl = await response.json() as { name?: string }
      if (idl.name) {
        const result = { name: idl.name, shortName: idl.name }
        resolveCache.set(programId, result)
        return result
      }
    }
  } catch {
    // Fall through to shortened address
  }

  // 3. Fallback to shortened address
  const result = { name: shortenAddress(programId, 4), shortName: shortenAddress(programId, 4) }
  resolveCache.set(programId, result)
  return result
}

export async function resolvePrograms(programIds: string[]): Promise<Map<string, ResolvedProgram>> {
  const unique = [...new Set(programIds)]
  const results = new Map<string, ResolvedProgram>()

  await Promise.allSettled(
    unique.map(async (id) => {
      const resolved = await resolveProgram(id)
      results.set(id, resolved)
    })
  )

  return results
}
