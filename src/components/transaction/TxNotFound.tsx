import { SearchX } from 'lucide-react'
import Link from 'next/link'

export function TxNotFound({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <SearchX className="w-12 h-12 text-text-tertiary" />
      <h2 className="text-lg font-medium text-text-primary">Transaction not found</h2>
      <p className="text-text-secondary text-sm max-w-md text-center">
        {message ?? 'The transaction could not be found. Check the signature and network selection.'}
      </p>
      <Link href="/" className="text-accent hover:text-accent-hover text-sm mt-2">
        Back to search
      </Link>
    </div>
  )
}
