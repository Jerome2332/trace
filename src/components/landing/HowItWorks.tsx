import { Search, GitBranch, Sparkles } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Paste a signature',
    description: 'Enter any Solana transaction signature to start debugging.',
  },
  {
    icon: GitBranch,
    title: 'See the full trace',
    description: 'Visualize the CPI call tree, logs, and account changes.',
  },
  {
    icon: Sparkles,
    title: 'Get an AI diagnosis',
    description: 'Claude explains what went wrong and how to fix it.',
  },
]

export function HowItWorks() {
  return (
    <section className="w-full max-w-2xl mx-auto mt-16 mb-12">
      <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider text-center mb-8">
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-bg-surface-2 flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-medium text-text-primary mt-3">{step.title}</h3>
              <p className="text-xs text-text-secondary mt-1">{step.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
