import { useState, useRef, useCallback } from 'react'

const SUPPORTED_DRUGS = [
  'CODEINE',
  'WARFARIN', 
  'CLOPIDOGREL',
  'SIMVASTATIN',
  'AZATHIOPRINE',
  'FLUOROURACIL',
]

export default function VcfUploader({ onSubmit, isLoading }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [customDrug, setCustomDrug] = useState('')
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef(null)

  const validateFile = (f) => {
    if (!f) return 'No file selected'
    if (!f.name.endsWith('.vcf')) return 'File must be a .vcf file'
    if (f.size > 5 * 1024 * 1024) return 'File size must be under 5 MB'
    return ''
  }

  const handleFile = useCallback((f) => {
    const err = validateFile(f)
    setFileError(err)
    if (!err) setFile(f)
    else setFile(null)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [handleFile])

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    setDragActive(e.type === 'dragover' || e.type === 'dragenter')
  }, [])

  const toggleDrug = (drug) => {
    setSelectedDrugs(prev =>
      prev.includes(drug) ? prev.filter(d => d !== drug) : [...prev, drug]
    )
  }

  const allDrugs = [
    ...selectedDrugs.filter(d => !SUPPORTED_DRUGS.includes(d)),
    ...selectedDrugs.filter(d => SUPPORTED_DRUGS.includes(d))
  ]

  const handleAddCustom = () => {
    const d = customDrug.trim().toUpperCase()
    if (d && !selectedDrugs.includes(d)) {
      setSelectedDrugs(prev => [...prev, d])
    }
    setCustomDrug('')
  }

  const handleSubmit = () => {
    if (!file || selectedDrugs.length === 0) return
    onSubmit(file, selectedDrugs)
  }

  const fileSizeKB = file ? (file.size / 1024).toFixed(1) : null

  return (
    <div style={{ opacity: 0, animation: 'fade-up 0.7s ease 0.2s forwards' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>
          // INPUT MODULE
        </p>
        <h2 className="font-display" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          Patient Genomic Data
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Upload VCF file and select target medications for pharmacogenomic analysis
        </p>
      </div>

      {/* VCF Upload Zone */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
          VCF FILE — VARIANT CALL FORMAT v4.2
        </label>
        <div
          className={`dropzone bracket-card ${dragActive ? 'dropzone-active' : ''}`}
          style={{
            borderRadius: '8px',
            padding: '2.5rem',
            textAlign: 'center',
            position: 'relative',
            transition: 'all 0.3s ease',
            background: file 
              ? 'rgba(0, 200, 170, 0.04)' 
              : 'var(--bg-deep)',
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".vcf"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {file ? (
            <div>
              {/* Success state */}
              <div style={{ 
                width: '48px', height: '48px',
                borderRadius: '8px',
                background: 'rgba(0, 230, 118, 0.1)',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="#00e676" strokeWidth="1.5"/>
                </svg>
              </div>
              <p className="font-mono" style={{ color: 'var(--safe)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                {file.name}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {fileSizeKB} KB • VCF v4.2 compatible
              </p>
              <button
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                onClick={e => { e.stopPropagation(); setFile(null); setFileError(''); }}
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              {/* Upload prompt */}
              <div style={{
                width: '56px', height: '56px',
                margin: '0 auto 1.25rem',
                border: `2px dashed ${dragActive ? 'var(--accent-teal)' : 'var(--border-glow)'}`,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3m0 0l-4 4m4-4l4 4" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.4rem' }}>
                Drop VCF file here or{' '}
                <span style={{ color: 'var(--accent-teal)' }}>browse</span>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                .vcf format • up to 5 MB • must include GENE, STAR, RS tags
              </p>
            </div>
          )}
        </div>

        {fileError && (
          <p style={{
            color: 'var(--toxic)', fontSize: '0.8rem', marginTop: '0.5rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            ⚠ {fileError}
          </p>
        )}
      </div>

      {/* Drug Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="section-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
          TARGET MEDICATIONS — SELECT ALL THAT APPLY
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {SUPPORTED_DRUGS.map(drug => {
            const active = selectedDrugs.includes(drug)
            return (
              <button
                key={drug}
                onClick={() => toggleDrug(drug)}
                className="font-mono"
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  fontWeight: active ? 600 : 400,
                  border: active 
                    ? '1px solid var(--accent-teal)' 
                    : '1px solid var(--border-dim)',
                  background: active 
                    ? 'rgba(0, 200, 170, 0.12)' 
                    : 'var(--bg-deep)',
                  color: active ? 'var(--accent-teal)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: active ? 'translateY(-1px)' : 'none',
                  boxShadow: active ? '0 0 12px rgba(0, 200, 170, 0.2)' : 'none',
                }}
              >
                {drug}
              </button>
            )
          })}
        </div>

        {/* Custom drug input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="pharma-input font-mono"
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              letterSpacing: '0.05em',
            }}
            placeholder="Add custom drug name..."
            value={customDrug}
            onChange={e => setCustomDrug(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
          />
          <button
            className="btn-secondary"
            style={{ padding: '8px 16px', borderRadius: '4px', fontSize: '0.8rem' }}
            onClick={handleAddCustom}
          >
            ADD
          </button>
        </div>

        {/* Selected drugs summary */}
        {selectedDrugs.length > 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {selectedDrugs.map(d => (
              <span key={d} className="gene-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {d}
                <button
                  onClick={() => toggleDrug(d)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: file && selectedDrugs.length > 0 && !isLoading ? 'pointer' : 'not-allowed',
          opacity: file && selectedDrugs.length > 0 && !isLoading ? 1 : 0.4,
          border: 'none',
        }}
        onClick={handleSubmit}
        disabled={!file || selectedDrugs.length === 0 || isLoading}
      >
        {isLoading ? (
          <>
            <div className="dna-loader" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
            ANALYZING VARIANTS...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M2 12h4m12 0h4M12 2v4m0 12v4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            RUN PHARMACOGENOMIC ANALYSIS
          </>
        )}
      </button>

      {/* Info row */}
      <div style={{ 
        marginTop: '1rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border-dim)',
      }}>
        {[
          { label: '6 GENES', sub: 'CYP2D6, CYP2C19...' },
          { label: 'CPIC ALIGNED', sub: 'Clinical guidelines' },
          { label: 'LLM EXPLAINED', sub: 'GPT-4 explanations' },
        ].map(({ label, sub }) => (
          <div key={label} style={{ flex: 1 }}>
            <p className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--accent-teal)', letterSpacing: '0.1em' }}>
              {label}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}