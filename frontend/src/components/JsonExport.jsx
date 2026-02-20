import { useState } from 'react'

function syntaxHighlight(json) {
  const str = JSON.stringify(json, null, 2)
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string'
      } else if (/true|false/.test(match)) {
        cls = 'json-bool'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

export default function JsonExport({ result }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  if (!result) return null

  const jsonStr = JSON.stringify(result, null, 2)
  const highlighted = syntaxHighlight(result)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = jsonStr
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pharmaguard_${result.patient_id || 'result'}_${result.drug || 'analysis'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const lineCount = jsonStr.split('\n').length

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-dim)',
        borderRadius: '10px',
        overflow: 'hidden',
        animation: 'fade-up 0.6s ease 0.3s both',
      }}
    >
      {/* Header bar */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(0,200,170,0.08)"/>
            <path d="M14 2v6h6M10 13l-2 2 2 2M14 13l2 2-2 2" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <p className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
              STRUCTURED OUTPUT
            </p>
            <p className="font-display" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              JSON Result
            </p>
          </div>
          <div style={{
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-dim)',
            borderRadius: '3px',
            padding: '2px 8px',
          }}>
            <span className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              {lineCount} lines
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Toggle expand */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              cursor: 'pointer',
            }}
          >
            {expanded ? 'COLLAPSE' : 'EXPAND'}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              border: copied ? '1px solid rgba(0, 230, 118, 0.5)' : '1px solid var(--border-glow)',
              background: copied ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
              color: copied ? 'var(--safe)' : 'var(--accent-teal)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                COPIED!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                COPY
              </>
            )}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="btn-primary"
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V3m0 12l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            DOWNLOAD
          </button>
        </div>
      </div>

      {/* JSON Viewer */}
      <div
        className="json-viewer"
        style={{
          padding: '1.25rem',
          maxHeight: expanded ? 'none' : '280px',
          overflow: 'auto',
          transition: 'max-height 0.4s ease',
          position: 'relative',
        }}
      >
        {/* Line numbers */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{
            flexShrink: 0,
            paddingRight: '12px',
            borderRight: '1px solid var(--border-dim)',
            textAlign: 'right',
            userSelect: 'none',
          }}>
            {jsonStr.split('\n').map((_, i) => (
              <div key={i} style={{ color: 'var(--text-muted)', opacity: 0.4, lineHeight: '1.7', fontSize: '0.68rem' }}>
                {i + 1}
              </div>
            ))}
          </div>
          <pre
            style={{ flex: 1, margin: 0, lineHeight: '1.7', fontSize: '0.75rem', overflowX: 'auto' }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>

        {/* Fade overlay when collapsed */}
        {!expanded && (
          <div style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '80px',
            background: 'linear-gradient(transparent, #040a10)',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Footer - quality metrics */}
      {result.quality_metrics && (
        <div style={{
          borderTop: '1px solid var(--border-dim)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          gap: '1.5rem',
          background: 'rgba(0, 0, 0, 0.1)',
        }}>
          {Object.entries(result.quality_metrics).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: val === true ? 'var(--safe)' : val === false ? 'var(--toxic)' : 'var(--adjust)',
                boxShadow: val === true ? '0 0 6px rgba(0,230,118,0.5)' : 'none',
              }} />
              <span className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {key.replace(/_/g, ' ')}:
              </span>
              <span className="font-mono" style={{
                fontSize: '0.62rem',
                color: val === true ? 'var(--safe)' : val === false ? 'var(--toxic)' : 'var(--text-secondary)',
                fontWeight: 600
              }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}