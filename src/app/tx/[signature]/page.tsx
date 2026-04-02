import type { Metadata } from 'next'
import { TxDetailClient } from './TxDetailClient'

interface PageProps {
  params: Promise<{ signature: string }>
  searchParams: Promise<{ network?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { signature } = await params
  const short = signature.slice(0, 8)
  return {
    title: `Trace: ${short}... — Solana Transaction Debugger`,
  }
}

export default async function TxPage({ params, searchParams }: PageProps) {
  const { signature } = await params
  const { network } = await searchParams

  return <TxDetailClient signature={signature} network={network ?? 'mainnet'} />
}
