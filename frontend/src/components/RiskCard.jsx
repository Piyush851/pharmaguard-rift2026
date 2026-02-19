import { useState, useEffect } from 'react'

const RISK_CONFIG = {
  'Safe': {
    className: 'risk-safe',
    color: 'var(--safe)',
    bg: 'var(--safe-dim)',
    border: 'rgba(0, 230, 118, 0.3)',
    glow: 'rgba(0, 230, 118, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="rgba(0,230,118,0.15)" stroke="#00e676" strokeWidth="1.5"/>
      </svg>
    ),
    label: 'SAFE',
    sublabel: 'Standard dosing recommended',
  },
  'Adjust Dosage': {
    className: 'risk-adjust',
    color: 'var(--adjust)',
    bg: 'var(--adjust-dim)',
    border: 'rgba(255, 171, 64, 0.3)',
    glow: 'rgba(255, 171, 64, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v4m0 4h.01" stroke="#ffab40" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="rgba(255,171,64,0.15)" stroke="#ffab40" strokeWidth="1.5"/>
      </svg>
    ),
    label: 'ADJUST DOSAGE',
    sublabel: 'Modified dosing required',
  },
  'Toxic': {
    className: 'risk-toxic',
    color: 'var(--toxic)',
    bg: 'var(--toxic-dim)',
    border: 'rgba(255, 23, 68, 0.3)',
    glow: 'rgba(255, 23, 68, 0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="rgba(255,23,68,0.15)" stroke="#ff1744" strokeWidth="1.5"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke="#ff1744" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: 'TOXIC',
    sublabel: 'High risk — avoid this drug',
  },
  'Ineffective': {
    className: 'risk-ineffective',
    color: 'var(--ineffective)',
    bg: 'var(--ineffective-dim)',
    border: 'rgba(170, 0, 255, 0.3)',
    glow: 'rgba(170, 0, 255, 0.15)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="rgba(170,0,255,0.15)" stroke="#aa00ff" strokeWidth="1.5"/>
        <path d="M8 12h8" stroke="#aa00ff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    label: 'INEFFECTIVE',
    sublabel: 'Drug likely will not work',
  },
  'Unknown': {
    className: 'risk-unknown',
    color: 'var(--unknown)',
    bg: 'var(--unknown-dim)',
    border: 'rgba(84, 110, 122, 0.3)',
    glow: 'rgba(84, 110, 122, 0.1)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="rgba(84,110,122,0.15)" stroke="#546e7a" strokeWidth="1.5"/>
        <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="#546e7a" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="0.5" fill="#546e7a" stroke="#546e7a"/>
      </svg>
    ),
    label: 'UNKNOWN',
    sublabel: 'Insufficient variant data',
  },
}

const SEVERITY_CONFIG = {
  none: { color: '#546e7a', label: 'None' },
  low: { color: '#80cbc4', label: 'Low' },
  moderate: { color: '#ffab40', label: 'Moderate' },
  high: { color: '#ff6d00', label: 'High' },
  critical: { color: '#ff1744', label: 'Critical' },
}

const PHENOTYPE_FULL = {
  PM: 'Poor Metabolizer',
  IM: 'Intermediate Metabolizer',
  NM: 'Normal Metabolizer',
  RM: 'Rapid Metabolizer',
  URM: 'Ultra-Rapid Metabolizer',
  Unknown: 'Unknown Phenotype',
}

export default function RiskCard({ result, drug }) {
  const [confidenceWidth, setConfidenceWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  const riskLabel = result?.risk_assessment?.risk_label || 'Unknown'
  const config = RISK_CONFIG[riskLabel] || RISK_CONFIG['Unknown']
  const confidence = result?.risk_assessment?.confidence_score || 0
  const severity = result?.risk_assessment?.severity || 'none'
  const severityConf = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG['none']

  const profile = result?.pharmacogenomic_profile || {}
  const recommendation = result?.clinical_recommendation || {}
  const variants = profile.detected_variants || []

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
    setTimeout(() => setConfidenceWidth(confidence * 100), 300)
  }, [confidence])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        background: 'var(--bg-card)',
        border: `1px solid ${config.border}`,
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: `0 0 40px ${config.glow}, 0 4px 20px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Top banner */}
      <div style={{
        background: `linear-gradient(135deg, ${config.bg}, transparent)`,
        borderBottom: `1px solid ${config.border}`,
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {config.icon}
          <div>
            <p className="font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: config.color, opacity: 0.7 }}>
              RISK ASSESSMENT
            </p>
            <p className="font-display" style={{ 
              fontSize: '1.3rem', 
              fontWeight: 800, 
              color: config.color,
              letterSpacing: '-0.01em',
              textShadow: `0 0 20px ${config.glow}`,
            }}>
              {config.label}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{config.sublabel}</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p className="font-mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
            DRUG TARGET
          </p>
          <p className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {drug}
          </p>
          <p style={{ 
            fontSize: '0.65rem',
            color: severityConf.color,
            fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.08em',
          }}>
            ● {severity.toUpperCase()} SEVERITY
          </p>
        </div>
      </div>

      {/* Confidence score */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="section-label">CONFIDENCE SCORE</span>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: config.color, fontWeight: 600 }}>
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{
              width: `${confidenceWidth}%`,
              background: `linear-gradient(90deg, ${config.color}, var(--accent-teal))`,
              boxShadow: `0 0 8px ${config.glow}`,
            }}
          />
        </div>
      </div>

      {/* Pharmacogenomic Profile */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-dim)' }}>
        <p className="section-label" style={{ marginBottom: '1rem' }}>PHARMACOGENOMIC PROFILE</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'PRIMARY GENE', value: profile.primary_gene || '—' },
            { label: 'DIPLOTYPE', value: profile.diplotype || '—' },
            { label: 'PHENOTYPE', value: profile.phenotype || '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-dim)',
              borderRadius: '6px',
              padding: '10px 12px',
            }}>
              <p className="section-label" style={{ fontSize: '0.55rem', marginBottom: '4px' }}>{label}</p>
              <p className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-teal)' }}>
                {value}
              </p>
              {label === 'PHENOTYPE' && PHENOTYPE_FULL[value] && (
                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {PHENOTYPE_FULL[value]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Detected variants */}
        {variants.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p className="section-label" style={{ fontSize: '0.55rem', marginBottom: '0.5rem' }}>DETECTED VARIANTS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {variants.map((v, i) => (
                <div key={i} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                }}>
                  <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--accent-teal)' }}>
                    {v.rsid || 'rs—'}
                  </span>
                  {v.impact && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{v.impact}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Recommendation */}
      {recommendation && Object.keys(recommendation).length > 0 && (
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <p className="section-label" style={{ marginBottom: '0.75rem' }}>CLINICAL RECOMMENDATION</p>
          {recommendation.action && (
            <div style={{
              background: `linear-gradient(135deg, ${config.bg}, transparent)`,
              border: `1px solid ${config.border}`,
              borderRadius: '6px',
              padding: '10px 14px',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{ width: '3px', height: '36px', background: config.color, borderRadius: '2px', flexShrink: 0 }} />
              <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {recommendation.action}
              </p>
            </div>
          )}
          {recommendation.dose_adjustment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <span className="section-label">DOSE ADJUSTMENT:</span>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: config.color }}>
                {recommendation.dose_adjustment}
              </span>
            </div>
          )}
          {recommendation.cpic_guideline && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {recommendation.cpic_guideline}
            </p>
          )}
        </div>
      )}
    </div>
  )
}