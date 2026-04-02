import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000
}

export function formatSol(lamports: number): string {
  const sol = lamportsToSol(lamports)
  if (Math.abs(sol) < 0.000001) return '0 SOL'
  return `${sol.toFixed(9).replace(/\.?0+$/, '')} SOL`
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

export function formatRelativeTime(unixTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - unixTimestamp

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatAbsoluteTime(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}
