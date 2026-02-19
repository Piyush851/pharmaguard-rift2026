import { useState, useEffect } from 'react'

export default function Explanation({ result }) {
  const [expanded, setExpanded] = useState(true)
  const [typing, setTyping] = useState(false)
  const [displayText, setDisplayText] = useState('')

  const llm = result?.llm_generated_explanation || {}
  const summary = llm.summary || ''
  const mechanism = llm.biological_mechanism || ''
  const clinical = llm.clinical_context || ''
  const variants_cited = llm.variants_cited || []

  // Typewriter effect for summary
  useEffect(() => {
    if (!summary) return
    setTyping(true)
    setDisplayText('')
    let i = 0
    const interval = setInterval(() => {
      setDisplayText(summary.slice(0, i + 1))
      i++
      if (i >= summary.length) {
        clearInterval(interval)
        setTyping(false)
      }
    }, 12)
    return () => clearInterval(interval)
  }, [summary])

  if (!result) return null

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-dim)',
        borderRadius: '10px',
        overflow: 'hidden',
        animation: 'fade-up 0.6s ease 0.2s both',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: expanded ? '1px solid var(--border-dim)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* AI brain icon */}
          <div style={{
            width: '32px', height: '32px',
            background: 'rgba(0, 200, 170, 0.1)',
            border: '1px solid rgba(0, 200, 170, 0.2)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="var(--accent-teal)" strokeWidth="1.5" fill="rgba(0,200,170,0.1)"/>
              <path d="M8 12h8M12 8v8" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'var(--accent-teal)', opacity: 0.7 }}>
              GPT-4 CLINICAL INTELLIGENCE
            </p>
            <p className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              LLM Explanation
            </p>
          </div>
          {typing && (
            <div style={{
              width: '8px', height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-teal)',
              animation: 'blink 0.8s ease-in-out infinite',
              boxShadow: '0 0 8px var(--accent-teal-glow)',
            }} />
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{
            color: 'var(--text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
          }}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Content */}
      {expanded && (
        <div style={{ padding: '1.5rem' }}>
          {/* Summary with typewriter */}
          {summary && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="section-label" style={{ marginBottom: '0.75rem' }}>CLINICAL SUMMARY</p>
              <div style={{
                background: '#040a10',
                border: '1px solid var(--border-dim)',
                borderRadius: '6px',
                padding: '1rem 1.25rem',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '10px', left: '12px',
                  display: 'flex', gap: '5px',
                }}>
                  {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                    <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, opacity: 0.6 }} />
                  ))}
                </div>
                <p className="font-mono" style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  marginTop: '1.2rem',
                  minHeight: '3rem',
                }}>
                  <span style={{ color: 'var(--accent-teal)', opacity: 0.5 }}>$ </span>
                  {displayText}
                  {typing && (
                    <span style={{
                      display: 'inline-block',
                      width: '2px',
                      height: '14px',
                      background: 'var(--accent-teal)',
                      marginLeft: '2px',
                      verticalAlign: 'middle',
                      animation: 'blink 0.8s step-end infinite',
                    }} />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Two-column: mechanism + clinical context */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {mechanism && (
              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-dim)',
                borderRadius: '6px',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="section-label" style={{ fontSize: '0.55rem' }}>BIOLOGICAL MECHANISM</p>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {mechanism}
                </p>
              </div>
            )}
            {clinical && (
              <div style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-dim)',
                borderRadius: '6px',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 14l6.16-3.422A12.083 12.083 0 0112 20.5a12.083 12.083 0 01-6.16-9.922L12 14z" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <p className="section-label" style={{ fontSize: '0.55rem' }}>CLINICAL CONTEXT</p>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {clinical}
                </p>
              </div>
            )}
          </div>

          {/* Variants cited */}
          {variants_cited.length > 0 && (
            <div>
              <p className="section-label" style={{ marginBottom: '0.6rem' }}>VARIANTS REFERENCED IN ANALYSIS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {variants_cited.map((v, i) => (
                  <div key={i} style={{
                    background: 'rgba(0, 200, 170, 0.06)',
                    border: '1px solid rgba(0, 200, 170, 0.15)',
                    borderRadius: '4px',
                    padding: '4px 10px',
                  }}>
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-teal)' }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            marginTop: '1.25rem',
            padding: '8px 12px',
            background: 'rgba(255, 171, 64, 0.05)',
            border: '1px solid rgba(255, 171, 64, 0.15)',
            borderRadius: '4px',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
              <path d="M12 9v4m0 4h.01" stroke="#ffab40" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ffab40" strokeWidth="1.5"/>
            </svg>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              This AI-generated analysis is for research and educational purposes. Clinical decisions must be validated by a licensed healthcare professional aligned with current CPIC guidelines.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}