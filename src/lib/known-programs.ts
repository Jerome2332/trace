export interface KnownProgram {
  name: string
  shortName: string
  category: 'native' | 'spl' | 'defi' | 'nft' | 'token'
}

export const KNOWN_PROGRAMS: Record<string, KnownProgram> = {
  '11111111111111111111111111111111': { name: 'System Program', shortName: 'System', category: 'native' },
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': { name: 'SPL Token', shortName: 'Token', category: 'spl' },
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': { name: 'Token-2022', shortName: 'Token22', category: 'spl' },
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': { name: 'Associated Token Account', shortName: 'ATA', category: 'spl' },
  'ComputeBudget111111111111111111111111111111': { name: 'Compute Budget', shortName: 'ComputeBudget', category: 'native' },
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': { name: 'Jupiter v6', shortName: 'Jupiter', category: 'defi' },
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': { name: 'Orca Whirlpool', shortName: 'Whirlpool', category: 'defi' },
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': { name: 'Orca v2', shortName: 'Orca', category: 'defi' },
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': { name: 'Metaplex Token Metadata', shortName: 'Metadata', category: 'nft' },
  'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K': { name: 'Magic Eden v2', shortName: 'MagicEden', category: 'nft' },
  'cmtDvXumGCrqC1Age74AVPhSRVXJMd4PeBorqK6Na9E': { name: 'Metaplex Bubblegum', shortName: 'Bubblegum', category: 'nft' },
  'PhoeNiXZ8ByJGLkxNfZRnkkvxYqz8Zif6yfGfP1SHx': { name: 'Phoenix DEX', shortName: 'Phoenix', category: 'defi' },
  'srmqPvymJeFKQ4zGQed1GFppgkRHL9kaELCbyksJtPX': { name: 'Serum DEX v3', shortName: 'Serum', category: 'defi' },
  'So11111111111111111111111111111111111111112': { name: 'Wrapped SOL', shortName: 'wSOL', category: 'token' },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { name: 'USDC', shortName: 'USDC', category: 'token' },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { name: 'USDT', shortName: 'USDT', category: 'token' },
  'Vote111111111111111111111111111111111111111': { name: 'Vote Program', shortName: 'Vote', category: 'native' },
  'Stake11111111111111111111111111111111111111': { name: 'Stake Program', shortName: 'Stake', category: 'native' },
  'BPFLoaderUpgradeab1e11111111111111111111111': { name: 'BPF Loader', shortName: 'BPFLoader', category: 'native' },
}
