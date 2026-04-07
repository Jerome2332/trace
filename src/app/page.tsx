import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { ExampleTransactions } from '@/components/search/ExampleTransactions'
import { HowItWorks } from '@/components/landing/HowItWorks'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col items-center justify-start pt-32 px-4">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6 -mt-20">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight">
            Debug any Solana transaction<span className="text-accent">.</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-lg mx-auto">
            Paste a signature to see the full CPI call tree, account changes, and an AI diagnosis of what went wrong.
          </p>
          <SearchBar size="hero" autoFocus />
          <ExampleTransactions />
        </div>
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
