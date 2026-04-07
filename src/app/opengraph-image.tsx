import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Trace - Solana Transaction Debugger'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#e8e8f0', letterSpacing: '-2px' }}>
            trace
          </span>
          <span style={{ fontSize: 72, fontWeight: 700, color: '#7c5cfc' }}>
            .
          </span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#8888aa',
            marginTop: 16,
            letterSpacing: '-0.5px',
          }}
        >
          Debug any Solana transaction.
        </div>
        <div
          style={{
            fontSize: 16,
            color: '#55556a',
            marginTop: 32,
            display: 'flex',
            gap: 24,
          }}
        >
          <span>CPI Call Trees</span>
          <span style={{ color: '#3a3a50' }}>|</span>
          <span>Account Diffs</span>
          <span style={{ color: '#3a3a50' }}>|</span>
          <span>AI Diagnosis</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
