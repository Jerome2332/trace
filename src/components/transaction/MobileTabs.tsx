'use client'

import { useState } from 'react'

interface MobileTabsProps {
  cpiTree: React.ReactNode
  logStream: React.ReactNode
  accountDiff: React.ReactNode
}

const tabs = [
  { key: 'cpi', label: 'Call Tree' },
  { key: 'logs', label: 'Logs' },
  { key: 'accounts', label: 'Accounts' },
] as const

type TabKey = (typeof tabs)[number]['key']

export function MobileTabs({ cpiTree, logStream, accountDiff }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('cpi')

  const contentMap: Record<TabKey, React.ReactNode> = {
    cpi: cpiTree,
    logs: logStream,
    accounts: accountDiff,
  }

  return (
    <div>
      <div className="flex bg-bg-surface-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-accent text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {contentMap[activeTab]}
      </div>
    </div>
  )
}
