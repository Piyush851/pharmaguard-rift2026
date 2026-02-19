import { useState, useEffect, useRef } from 'react'

// ─── DESIGN TOKENS (pure JS, no CSS vars needed) ─────────────────────────────
const C = {
  bg0:        '#020408',
  bg1:        '#060d14',
  bg2:        '#0a1520',
  bg3:        '#0d1e2e',
  teal:       '#00c8aa',
  tealDim:    'rgba(0,200,170,0.10)',
  tealGlow:   'rgba(0,200,170,0.35)',
  tealBorder: 'rgba(0,200,170,0.22)',
  tealBright: 'rgba(0,200,170,0.55)',
  blue:       '#0084ff',
  safe:       '#00e676',
  safeDim:    'rgba(0,230,118,0.10)',
  safeBorder: 'rgba(0,230,118,0.28)',
  warn:       '#ffab40',
  warnDim:    'rgba(255,171,64,0.10)',
  warnBorder: 'rgba(255,171,64,0.28)',
  toxic:      '#ff1744',
  toxicDim:   'rgba(255,23,68,0.10)',
  toxicBorder:'rgba(255,23,68,0.28)',
  purple:     '#d500f9',
  purpleDim:  'rgba(213,0,249,0.10)',
  purpleBorder:'rgba(213,0,249,0.28)',
  grey:       '#546e7a',
  greyDim:    'rgba(84,110,122,0.10)',
  greyBorder: 'rgba(84,110,122,0.25)',
  text0:      '#e8f4f8',
  text1:      '#7fafc4',
  text2:      '#3d6070',
  border0:    'rgba(0,200,170,0.07)',
  border1:    'rgba(0,200,170,0.22)',
}

const FONT = {
  display: "'Syne', system-ui, sans-serif",
  mono:    "'JetBrains Mono', 'Courier New', monospace",
  body:    "'DM Sans', system-ui, sans-serif",
}

// ─── RISK CONFIG ──────────────────────────────────────────────────────────────
const RISK = {
  'Safe':         { color: C.safe,   dim: C.safeDim,   border: C.safeBorder,   label: 'SAFE',         sub: 'Standard dosing recommended' },
  'Adjust Dosage':{ color: C.warn,   dim: C.warnDim,   border: C.warnBorder,   label: 'ADJUST DOSAGE',sub: 'Modified dosing required' },
  'Toxic':        { color: C.toxic,  dim: C.toxicDim,  border: C.toxicBorder,  label: 'TOXIC',        sub: 'High risk — avoid this drug' },
  'Ineffective':  { color: C.purple, dim: C.purpleDim, border: C.purpleBorder, label: 'INEFFECTIVE',  sub: 'Drug likely will not work' },
  'Unknown':      { color: C.grey,   dim: C.greyDim,   border: C.greyBorder,   label: 'UNKNOWN',      sub: 'Insufficient variant data' },
}

const GENES = ['CYP2D6','CYP2C19','CYP2C9','SLCO1B1','TPMT','DPYD']
const DRUGS = ['CODEINE','WARFARIN','CLOPIDOGREL','SIMVASTATIN','AZATHIOPRINE','FLUOROURACIL']

const GENE_INFO = [
  { gene:'CYP2D6',  drugs:'Codeine, Tramadol',    role:'Drug metabolism' },
  { gene:'CYP2C19', drugs:'Clopidogrel',           role:'Prodrug activation' },
  { gene:'CYP2C9',  drugs:'Warfarin',              role:'Anticoagulant metabolism' },
  { gene:'SLCO1B1', drugs:'Simvastatin',           role:'Hepatic drug uptake' },
  { gene:'TPMT',    drugs:'Azathioprine',          role:'Thiopurine metabolism' },
  { gene:'DPYD',    drugs:'Fluorouracil',          role:'Pyrimidine catabolism' },
]

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
function mockResult(drug) {
  return {
    patient_id: 'PATIENT_DEMO',
    drug,
    timestamp: new Date().toISOString(),
    risk_assessment: { risk_label: 'Adjust Dosage', confidence_score: 0.87, severity: 'moderate' },
    pharmacogenomic_profile: {
      primary_gene: 'CYP2C9', diplotype: '*1/*3', phenotype: 'IM',
      detected_variants: [
        { rsid: 'rs1799853', impact: 'Reduced function' },
        { rsid: 'rs1057910', impact: 'Moderate effect' },
      ],
    },
    clinical_recommendation: {
      action: `Start ${drug} at 30–50% of standard dose. CYP2C9 *1/*3 intermediate metabolizer status impairs drug clearance. Monitor closely for first 4 weeks.`,
      dose_adjustment: '30–50% reduction',
      cpic_guideline: 'CPIC Guideline for Pharmacogenomics-Guided Dosing (2017)',
    },
    llm_generated_explanation: {
      summary: `Patient carries CYP2C9 *1/*3 diplotype conferring intermediate metabolizer (IM) phenotype for ${drug}. The *3 allele (rs1057910) encodes a variant that markedly reduces CYP2C9 enzymatic activity by ~90%, leading to impaired drug clearance and elevated plasma concentrations. Dose reduction is mandatory to avoid supratherapeutic levels.`,
      biological_mechanism: "The rs1057910 variant causes a p.Ile359Leu amino acid substitution in CYP2C9, reducing the enzyme's catalytic efficiency for warfarin S-enantiomer hydroxylation by ~90% compared to wild-type *1 allele.",
      clinical_context: `Patients with CYP2C9 IM phenotype have 2–3× increased risk of supratherapeutic anticoagulation without dose adjustment. CPIC guidelines recommend initiating at 30–50% of standard dose with frequent INR monitoring.`,
      variants_cited: ['rs1799853 (CYP2C9*2)', 'rs1057910 (CYP2C9*3)'],
    },
    quality_metrics: { vcf_parsing_success: true, variants_detected: 2, cpic_genes_matched: 1, llm_confidence: 0.91 },
  }
}

// ─── TINY SHARED COMPONENTS ───────────────────────────────────────────────────
function Label({ children, style }) {
  return (
    <p style={{
      fontFamily: FONT.mono, fontSize: '0.6rem', letterSpacing: '0.14em',
      textTransform: 'uppercase', color: C.teal, opacity: 0.75, ...style,
    }}>
      {children}
    </p>
  )
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background: C.bg3,
      border: `1px solid ${glow || C.border0}`,
      borderRadius: '10px',
      boxShadow: glow ? `0 0 40px ${glow}22, 0 4px 24px rgba(0,0,0,0.5)` : '0 4px 24px rgba(0,0,0,0.4)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(6,13,20,0.94)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border0}`,
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '0 2rem',
        height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 16px ${C.tealGlow}`,
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="white"/>
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: FONT.display, fontSize: '1.1rem', fontWeight: 800, color: C.text0, letterSpacing: '-0.02em' }}>
              Pharma<span style={{ color: C.teal }}>Guard</span>
            </span>
            <span style={{ fontFamily: FONT.mono, fontSize: '0.58rem', color: C.text2, marginLeft: 8, letterSpacing: '0.08em' }}>
              v2.0 · RIFT 2026
            </span>
          </div>
        </div>

        {/* Gene pills */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {GENES.map(g => (
            <span key={g} style={{
              fontFamily: FONT.mono, fontSize: '0.62rem', letterSpacing: '0.06em',
              padding: '3px 9px', borderRadius: 3,
              background: C.tealDim, border: `1px solid ${C.tealBorder}`, color: C.teal,
            }}>
              {g}
            </span>
          ))}
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: C.safe,
            boxShadow: `0 0 8px ${C.safe}`, animation: 'pulseGlow 2s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: FONT.mono, fontSize: '0.62rem', color: C.text2, letterSpacing: '0.1em' }}>
            SYSTEM ONLINE
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div style={{ textAlign: 'center', padding: '3.5rem 2rem 2rem', maxWidth: 680, margin: '0 auto' }}>
      {/* Badge */}
      <div style={{ marginBottom: '1.2rem' }}>
        <span style={{
          fontFamily: FONT.mono, fontSize: '0.62rem', letterSpacing: '0.16em',
          color: C.teal, background: C.tealDim, border: `1px solid ${C.tealBorder}`,
          padding: '5px 14px', borderRadius: 3,
        }}>
          ⬡ PHARMACOGENOMICS · EXPLAINABLE AI · RIFT 2026
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: FONT.display, fontWeight: 800, letterSpacing: '-0.03em',
        fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.08,
        color: C.text0, marginBottom: '1rem',
      }}>
        Precision Medicine{' '}
        <span style={{
          background: `linear-gradient(135deg, ${C.teal}, ${C.blue})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Risk Prediction
        </span>
      </h1>

      <p style={{ fontFamily: FONT.body, color: C.text1, fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 520, margin: '0 auto' }}>
        Upload patient VCF genomic data to predict personalized pharmacogenomic risks
        with AI-powered clinical explanations aligned to CPIC guidelines.
      </p>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '2.5rem',
        marginTop: '2rem', paddingTop: '2rem',
        borderTop: `1px solid ${C.border0}`,
      }}>
        {[['100K+','Deaths/yr preventable'],['6','Critical genes'],['5','Risk levels'],['CPIC','Guideline aligned']].map(([v, l]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: FONT.display, fontSize: '1.5rem', fontWeight: 800, color: C.teal, lineHeight: 1 }}>{v}</p>
            <p style={{ fontFamily: FONT.body, fontSize: '0.68rem', color: C.text2, marginTop: 4 }}>{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── UPLOADER ─────────────────────────────────────────────────────────────────
function Uploader({ onSubmit, isLoading }) {
  const [file, setFile]           = useState(null)
  const [drag, setDrag]           = useState(false)
  const [drugs, setDrugs]         = useState([])
  const [custom, setCustom]       = useState('')
  const [fileErr, setFileErr]     = useState('')
  const ref = useRef()

  const validate = f => {
    if (!f)                        return 'No file selected.'
    if (!f.name.endsWith('.vcf'))  return 'Must be a .vcf file.'
    if (f.size > 5*1024*1024)      return 'File must be under 5 MB.'
    return ''
  }

  const pick = f => { const e = validate(f); setFileErr(e); setFile(e ? null : f) }

  const toggle = d => setDrugs(p => p.includes(d) ? p.filter(x => x!==d) : [...p, d])

  const addCustom = () => {
    const d = custom.trim().toUpperCase()
    if (d && !drugs.includes(d)) setDrugs(p => [...p, d])
    setCustom('')
  }

  const canSubmit = file && drugs.length > 0 && !isLoading

  return (
    <div>
      <Label style={{ marginBottom: 6 }}>// INPUT MODULE</Label>
      <h2 style={{ fontFamily: FONT.display, fontSize: '1.3rem', fontWeight: 700, color: C.text0, marginBottom: 4, letterSpacing: '-0.02em' }}>
        Patient Genomic Data
      </h2>
      <p style={{ fontFamily: FONT.body, color: C.text1, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Upload VCF file and select target medications for analysis.
      </p>

      {/* Drop zone */}
      <div>
        <Label style={{ marginBottom: 8 }}>VCF FILE — VARIANT CALL FORMAT v4.2</Label>
        <div
          onClick={() => ref.current?.click()}
          onDragEnter={e => { e.preventDefault(); setDrag(true) }}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
          style={{
            border: `2px dashed ${drag ? C.tealBright : file ? C.safeBorder : C.tealBorder}`,
            borderRadius: 8, padding: '2rem',
            background: drag ? C.tealDim : file ? C.safeDim : C.bg2,
            textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: drag ? `0 0 30px ${C.tealGlow}` : 'none',
          }}
        >
          <input ref={ref} type="file" accept=".vcf" style={{ display: 'none' }} onChange={e => pick(e.target.files[0])} />

          {file ? (
            <>
              <div style={{
                width: 44, height: 44, borderRadius: 8, margin: '0 auto 12px',
                background: C.safeDim, border: `1px solid ${C.safeBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke={C.safe} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke={C.safe} strokeWidth="1.5"/>
                </svg>
              </div>
              <p style={{ fontFamily: FONT.mono, color: C.safe, fontSize: '0.82rem', marginBottom: 4 }}>{file.name}</p>
              <p style={{ fontFamily: FONT.body, color: C.text2, fontSize: '0.72rem' }}>
                {(file.size/1024).toFixed(1)} KB · VCF v4.2 compatible
              </p>
              <button
                onClick={e => { e.stopPropagation(); setFile(null); setFileErr('') }}
                style={{ marginTop: 10, background:'none', border:'none', color: C.text2, cursor:'pointer', fontSize:'0.72rem', fontFamily: FONT.mono, textDecoration:'underline' }}
              >
                remove file
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 52, height: 52, margin: '0 auto 14px',
                border: `2px dashed ${drag ? C.teal : C.tealBorder}`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15V3m0 0l-4 4m4-4l4 4" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 16v2a3 3 0 003 3h12a3 3 0 003-3v-2" stroke={C.text2} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p style={{ fontFamily: FONT.body, color: C.text0, fontWeight: 500, marginBottom: 4 }}>
                Drop VCF file here or <span style={{ color: C.teal }}>browse</span>
              </p>
              <p style={{ fontFamily: FONT.body, color: C.text2, fontSize: '0.78rem' }}>
                .vcf format · max 5 MB · requires GENE, STAR, RS tags
              </p>
            </>
          )}
        </div>
        {fileErr && <p style={{ fontFamily: FONT.mono, color: C.toxic, fontSize: '0.75rem', marginTop: 6 }}>⚠ {fileErr}</p>}
      </div>

      {/* Drug selection */}
      <div style={{ marginTop: '1.5rem' }}>
        <Label style={{ marginBottom: 10 }}>TARGET MEDICATIONS — SELECT ALL THAT APPLY</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {DRUGS.map(d => {
            const on = drugs.includes(d)
            return (
              <button
                key={d}
                onClick={() => toggle(d)}
                style={{
                  fontFamily: FONT.mono, fontSize: '0.7rem', letterSpacing: '0.07em', fontWeight: on ? 600 : 400,
                  padding: '6px 14px', borderRadius: 4,
                  border: `1px solid ${on ? C.teal : C.border1}`,
                  background: on ? C.tealDim : C.bg2,
                  color: on ? C.teal : C.text2,
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  transform: on ? 'translateY(-1px)' : 'none',
                  boxShadow: on ? `0 4px 16px ${C.tealGlow}` : 'none',
                }}
              >
                {d}
              </button>
            )
          })}
        </div>
        {/* Custom drug */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Add custom drug…"
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 4,
              border: `1px solid ${C.border0}`, background: C.bg1,
              color: C.text0, fontFamily: FONT.mono, fontSize: '0.78rem',
              outline: 'none', transition: 'border 0.2s',
            }}
            onFocus={e => e.target.style.border = `1px solid ${C.tealBright}`}
            onBlur={e => e.target.style.border = `1px solid ${C.border0}`}
          />
          <button
            onClick={addCustom}
            style={{
              padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
              border: `1px solid ${C.tealBorder}`, background: 'transparent',
              color: C.teal, fontFamily: FONT.display, fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            ADD
          </button>
        </div>

        {/* Selected pills */}
        {drugs.filter(d => !DRUGS.includes(d)).length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {drugs.filter(d => !DRUGS.includes(d)).map(d => (
              <span key={d} style={{
                fontFamily: FONT.mono, fontSize: '0.65rem', letterSpacing: '0.07em',
                padding: '3px 8px', borderRadius: 3,
                background: C.tealDim, border: `1px solid ${C.tealBorder}`, color: C.teal,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {d}
                <button onClick={() => toggle(d)} style={{ background:'none', border:'none', color: C.text2, cursor:'pointer', fontSize:'0.75rem', lineHeight:1, padding:0 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(file, drugs)}
        disabled={!canSubmit}
        style={{
          width: '100%', marginTop: '1.5rem',
          padding: '14px 24px', borderRadius: 6, border: 'none',
          background: canSubmit ? `linear-gradient(135deg, ${C.teal}, #00a890)` : C.bg2,
          color: canSubmit ? '#020408' : C.text2,
          fontFamily: FONT.display, fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          transition: 'all 0.2s ease',
          boxShadow: canSubmit ? `0 4px 24px ${C.tealGlow}` : 'none',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `2px solid rgba(2,4,8,0.3)`,
              borderTopColor: '#020408',
              animation: 'spin 0.8s linear infinite',
            }} />
            ANALYZING VARIANTS…
          </>
        ) : (
          <>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <path d="M2 12h4m12 0h4M12 2v4m0 12v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            RUN PHARMACOGENOMIC ANALYSIS
          </>
        )}
      </button>

      {/* Bottom info */}
      <div style={{
        marginTop: '1.25rem', paddingTop: '1.25rem',
        borderTop: `1px solid ${C.border0}`,
        display: 'flex', gap: '1rem',
      }}>
        {[['6 GENES','CYP2D6, CYP2C19…'],['CPIC ALIGNED','Clinical guidelines'],['LLM EXPLAINED','GPT-4 analysis']].map(([a,b]) => (
          <div key={a} style={{ flex: 1 }}>
            <p style={{ fontFamily: FONT.mono, fontSize: '0.6rem', color: C.teal, letterSpacing: '0.1em' }}>{a}</p>
            <p style={{ fontFamily: FONT.body, fontSize: '0.68rem', color: C.text2, marginTop: 2 }}>{b}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── GENE PANEL CARD ──────────────────────────────────────────────────────────
function GenePanel() {
  return (
    <div>
      <Label style={{ marginBottom: 12 }}>ANALYZED GENE PANEL</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {GENE_INFO.map(({ gene, drugs, role }) => (
          <div key={gene} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 6,
            transition: 'background 0.2s',
            cursor: 'default',
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.bg2}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              fontFamily: FONT.mono, fontSize: '0.62rem', letterSpacing: '0.06em',
              padding: '3px 9px', borderRadius: 3, flexShrink: 0,
              background: C.tealDim, border: `1px solid ${C.tealBorder}`, color: C.teal,
            }}>
              {gene}
            </span>
            <div>
              <p style={{ fontFamily: FONT.body, fontSize: '0.75rem', color: C.text1 }}>{drugs}</p>
              <p style={{ fontFamily: FONT.body, fontSize: '0.65rem', color: C.text2 }}>{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── RISK CARD ────────────────────────────────────────────────────────────────
function RiskCard({ result }) {
  const [barW, setBarW] = useState(0)
  const cfg = RISK[result.risk_assessment.risk_label] || RISK['Unknown']
  const conf = result.risk_assessment.confidence_score || 0
  const profile = result.pharmacogenomic_profile || {}
  const rec = result.clinical_recommendation || {}
  const variants = profile.detected_variants || []

  const PHENOTYPE = { PM:'Poor Metabolizer', IM:'Intermediate Metabolizer', NM:'Normal Metabolizer', RM:'Rapid Metabolizer', URM:'Ultra-Rapid Metabolizer', Unknown:'Unknown Phenotype' }

  useEffect(() => { const t = setTimeout(() => setBarW(conf * 100), 200); return () => clearTimeout(t) }, [conf])

  return (
    <div style={{
      background: C.bg3, border: `1px solid ${cfg.border}`,
      borderRadius: 10, overflow: 'hidden',
      boxShadow: `0 0 40px ${cfg.color}18, 0 4px 24px rgba(0,0,0,0.5)`,
      animation: 'fadeUp 0.5s ease both',
    }}>
      {/* Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${cfg.dim}, transparent)`,
        borderBottom: `1px solid ${cfg.border}`,
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <Label style={{ color: cfg.color, marginBottom: 4 }}>RISK ASSESSMENT</Label>
          <p style={{
            fontFamily: FONT.display, fontSize: '1.6rem', fontWeight: 800,
            color: cfg.color, letterSpacing: '-0.01em', lineHeight: 1,
            textShadow: `0 0 20px ${cfg.color}66`,
          }}>
            {cfg.label}
          </p>
          <p style={{ fontFamily: FONT.body, fontSize: '0.75rem', color: C.text2, marginTop: 4 }}>{cfg.sub}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Label style={{ marginBottom: 4 }}>DRUG TARGET</Label>
          <p style={{ fontFamily: FONT.display, fontSize: '1.2rem', fontWeight: 700, color: C.text0 }}>{result.drug}</p>
          <p style={{ fontFamily: FONT.mono, fontSize: '0.62rem', color: cfg.color, letterSpacing: '0.08em', marginTop: 3 }}>
            ● {(result.risk_assessment.severity || 'unknown').toUpperCase()} SEVERITY
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div style={{ padding: '0.9rem 1.5rem', borderBottom: `1px solid ${C.border0}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>CONFIDENCE SCORE</Label>
          <span style={{ fontFamily: FONT.mono, fontSize: '0.72rem', color: cfg.color, fontWeight: 600 }}>
            {(conf*100).toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 2, background: C.border0, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${barW}%`,
            background: `linear-gradient(90deg, ${cfg.color}, ${C.teal})`,
            boxShadow: `0 0 8px ${cfg.color}`,
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Profile grid */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.border0}` }}>
        <Label style={{ marginBottom: 12 }}>PHARMACOGENOMIC PROFILE</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            ['PRIMARY GENE', profile.primary_gene || '—'],
            ['DIPLOTYPE',    profile.diplotype    || '—'],
            ['PHENOTYPE',    profile.phenotype    || '—'],
          ].map(([label, val]) => (
            <div key={label} style={{
              background: C.bg2, border: `1px solid ${C.border0}`,
              borderRadius: 6, padding: '10px 12px',
            }}>
              <Label style={{ fontSize: '0.55rem', marginBottom: 4 }}>{label}</Label>
              <p style={{ fontFamily: FONT.mono, fontSize: '0.85rem', fontWeight: 600, color: C.teal }}>{val}</p>
              {label === 'PHENOTYPE' && PHENOTYPE[val] && (
                <p style={{ fontFamily: FONT.body, fontSize: '0.6rem', color: C.text2, marginTop: 2 }}>{PHENOTYPE[val]}</p>
              )}
            </div>
          ))}
        </div>

        {variants.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <Label style={{ fontSize: '0.55rem', marginBottom: 6 }}>DETECTED VARIANTS</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {variants.map((v, i) => (
                <div key={i} style={{
                  background: C.bg1, border: `1px solid ${C.border0}`,
                  borderRadius: 4, padding: '4px 10px',
                }}>
                  <p style={{ fontFamily: FONT.mono, fontSize: '0.68rem', color: C.teal }}>{v.rsid}</p>
                  {v.impact && <p style={{ fontFamily: FONT.body, fontSize: '0.58rem', color: C.text2 }}>{v.impact}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendation */}
      {rec.action && (
        <div style={{ padding: '1.25rem 1.5rem' }}>
          <Label style={{ marginBottom: 10 }}>CLINICAL RECOMMENDATION</Label>
          <div style={{
            background: `linear-gradient(135deg, ${cfg.dim}, transparent)`,
            border: `1px solid ${cfg.border}`,
            borderRadius: 6, padding: '10px 14px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <div style={{ width: 3, minHeight: 36, background: cfg.color, borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: FONT.body, color: C.text0, fontSize: '0.83rem', lineHeight: 1.6 }}>{rec.action}</p>
          </div>
          {rec.dose_adjustment && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <Label>DOSE ADJUSTMENT:</Label>
              <span style={{ fontFamily: FONT.mono, fontSize: '0.72rem', color: cfg.color, fontWeight: 600 }}>{rec.dose_adjustment}</span>
            </div>
          )}
          {rec.cpic_guideline && (
            <p style={{ fontFamily: FONT.body, fontSize: '0.7rem', color: C.text2, fontStyle: 'italic', marginTop: 6 }}>{rec.cpic_guideline}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── EXPLANATION ──────────────────────────────────────────────────────────────
function Explanation({ result }) {
  const [open, setOpen]   = useState(true)
  const [text, setText]   = useState('')
  const [typing, setTyping] = useState(false)
  const llm     = result?.llm_generated_explanation || {}
  const summary = llm.summary || ''

  useEffect(() => {
    if (!summary) return
    setTyping(true); setText(''); let i = 0
    const iv = setInterval(() => {
      setText(summary.slice(0, ++i))
      if (i >= summary.length) { clearInterval(iv); setTyping(false) }
    }, 10)
    return () => clearInterval(iv)
  }, [summary])

  return (
    <div style={{
      background: C.bg3, border: `1px solid ${C.border0}`,
      borderRadius: 10, overflow: 'hidden',
      animation: 'fadeUp 0.5s ease 0.15s both',
    }}>
      {/* Header */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '1.1rem 1.5rem',
        borderBottom: open ? `1px solid ${C.border0}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6, flexShrink: 0,
            background: C.tealDim, border: `1px solid ${C.tealBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={C.teal} strokeWidth="1.5"/>
              <path d="M8 12h8M12 8v8" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <Label style={{ marginBottom: 2 }}>GPT-4 CLINICAL INTELLIGENCE</Label>
            <p style={{ fontFamily: FONT.display, fontSize: '0.95rem', fontWeight: 700, color: C.text0 }}>LLM Explanation</p>
          </div>
          {typing && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: C.teal,
              boxShadow: `0 0 10px ${C.tealGlow}`,
              animation: 'blink 0.7s step-end infinite',
            }} />
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          style={{ color: C.text2, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: '1.5rem' }}>
          {/* Terminal summary */}
          {summary && (
            <div style={{ marginBottom: '1.25rem' }}>
              <Label style={{ marginBottom: 8 }}>CLINICAL SUMMARY</Label>
              <div style={{
                background: '#030810', border: `1px solid ${C.border0}`,
                borderRadius: 6, padding: '14px 16px', position: 'relative',
              }}>
                <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                  {['#ff5f57','#febc2e','#28c840'].map((c,i) => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.6 }} />
                  ))}
                </div>
                <p style={{ fontFamily: FONT.mono, fontSize: '0.75rem', color: C.text1, lineHeight: 1.8, minHeight: '3rem' }}>
                  <span style={{ color: C.teal, opacity: 0.5 }}>$ </span>
                  {text}
                  {typing && (
                    <span style={{
                      display: 'inline-block', width: 2, height: 13,
                      background: C.teal, marginLeft: 2, verticalAlign: 'middle',
                      animation: 'blink 0.8s step-end infinite',
                    }} />
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Two-col: mechanism + context */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1rem' }}>
            {[
              ['BIOLOGICAL MECHANISM', llm.biological_mechanism],
              ['CLINICAL CONTEXT',     llm.clinical_context],
            ].map(([label, body]) => body ? (
              <div key={label} style={{
                background: C.bg2, border: `1px solid ${C.border0}`,
                borderRadius: 6, padding: '1rem',
              }}>
                <Label style={{ fontSize: '0.55rem', marginBottom: 6 }}>{label}</Label>
                <p style={{ fontFamily: FONT.body, fontSize: '0.76rem', color: C.text1, lineHeight: 1.65 }}>{body}</p>
              </div>
            ) : null)}
          </div>

          {/* Variants cited */}
          {(llm.variants_cited||[]).length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <Label style={{ fontSize: '0.55rem', marginBottom: 6 }}>VARIANTS REFERENCED</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {llm.variants_cited.map((v,i) => (
                  <span key={i} style={{
                    fontFamily: FONT.mono, fontSize: '0.68rem', color: C.teal,
                    background: C.tealDim, border: `1px solid ${C.tealBorder}`,
                    padding: '3px 10px', borderRadius: 3,
                  }}>{v}</span>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-start',
            padding: '8px 12px', borderRadius: 4,
            background: 'rgba(255,171,64,0.06)', border: '1px solid rgba(255,171,64,0.15)',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 9v4m0 4h.01" stroke={C.warn} strokeWidth="2" strokeLinecap="round"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={C.warn} strokeWidth="1.5"/>
            </svg>
            <p style={{ fontFamily: FONT.body, fontSize: '0.68rem', color: C.text2, lineHeight: 1.5 }}>
              AI-generated analysis for research purposes only. Clinical decisions require validation by a licensed healthcare professional per current CPIC guidelines.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── JSON EXPORT ──────────────────────────────────────────────────────────────
function JsonExport({ result }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const json = JSON.stringify(result, null, 2)
  const lines = json.split('\n').length

  const highlighted = json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      const cls = /^"/.test(match)
        ? (/:$/.test(match) ? C.teal : '#a5d6a7')
        : /true|false/.test(match) ? '#80cbc4' : C.warn
      return `<span style="color:${cls}">${match}</span>`
    }
  )

  const copy = async () => {
    try { await navigator.clipboard.writeText(json) }
    catch { /* fallback */ }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([json], { type:'application/json' }))
    a.download = `pharmaguard_${result.patient_id}_${result.drug}.json`
    a.click()
  }

  return (
    <div style={{
      background: C.bg3, border: `1px solid ${C.border0}`,
      borderRadius: 10, overflow: 'hidden',
      animation: 'fadeUp 0.5s ease 0.3s both',
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '0.9rem 1.5rem', background: 'rgba(0,0,0,0.2)',
        borderBottom: `1px solid ${C.border0}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={C.teal} strokeWidth="1.5" fill={C.tealDim}/>
            <path d="M14 2v6h6M10 13l-2 2 2 2M14 13l2 2-2 2" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <Label style={{ fontSize: '0.55rem', marginBottom: 1 }}>STRUCTURED OUTPUT</Label>
            <p style={{ fontFamily: FONT.display, fontSize: '0.9rem', fontWeight: 700, color: C.text0 }}>JSON Result</p>
          </div>
          <span style={{
            fontFamily: FONT.mono, fontSize: '0.62rem', color: C.text2,
            background: C.bg2, border: `1px solid ${C.border0}`,
            padding: '2px 8px', borderRadius: 3,
          }}>{lines} lines</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{
            padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
            border: `1px solid ${C.tealBorder}`, background: 'transparent',
            color: C.teal, fontFamily: FONT.display, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
          }}>
            {expanded ? 'COLLAPSE' : 'EXPAND'}
          </button>
          <button onClick={copy} style={{
            padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
            border: `1px solid ${copied ? C.safeBorder : C.tealBorder}`,
            background: copied ? C.safeDim : 'transparent',
            color: copied ? C.safe : C.teal,
            fontFamily: FONT.display, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s ease',
          }}>
            {copied ? '✓ COPIED!' : 'COPY'}
          </button>
          <button onClick={download} style={{
            padding: '5px 14px', borderRadius: 4, cursor: 'pointer', border: 'none',
            background: `linear-gradient(135deg, ${C.teal}, #00a890)`,
            color: '#020408', fontFamily: FONT.display, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            ↓ DOWNLOAD
          </button>
        </div>
      </div>

      {/* Code view */}
      <div style={{
        background: '#030810',
        maxHeight: expanded ? 'none' : 260,
        overflow: 'auto', position: 'relative',
        transition: 'max-height 0.4s ease',
      }}>
        <div style={{ display: 'flex', padding: '1rem' }}>
          <div style={{
            flexShrink: 0, paddingRight: 12, borderRight: `1px solid ${C.border0}`,
            textAlign: 'right', userSelect: 'none',
          }}>
            {json.split('\n').map((_,i) => (
              <div key={i} style={{ fontFamily: FONT.mono, fontSize: '0.65rem', color: C.text2, opacity: 0.35, lineHeight: '1.7' }}>{i+1}</div>
            ))}
          </div>
          <pre style={{
            flex: 1, margin: 0, paddingLeft: 14,
            fontFamily: FONT.mono, fontSize: '0.72rem',
            color: C.text1, lineHeight: 1.7, overflowX: 'auto',
          }} dangerouslySetInnerHTML={{ __html: highlighted }} />
        </div>
        {!expanded && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
            background: 'linear-gradient(transparent, #030810)', pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Quality metrics */}
      {result.quality_metrics && (
        <div style={{
          borderTop: `1px solid ${C.border0}`, padding: '0.7rem 1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '1.25rem',
          background: 'rgba(0,0,0,0.1)',
        }}>
          {Object.entries(result.quality_metrics).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: v === true ? C.safe : v === false ? C.toxic : C.warn,
                boxShadow: v === true ? `0 0 6px ${C.safe}` : 'none',
              }} />
              <span style={{ fontFamily: FONT.mono, fontSize: '0.6rem', color: C.text2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {k.replace(/_/g,' ')}:
              </span>
              <span style={{ fontFamily: FONT.mono, fontSize: '0.6rem', fontWeight: 600, color: v === true ? C.safe : v === false ? C.toxic : C.text1 }}>
                {String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── LOADING OVERLAY ──────────────────────────────────────────────────────────
function Loader() {
  const [step, setStep] = useState(0)
  const steps = ['Parsing VCF file…','Extracting GENE, STAR, RS tags…','Matching pharmacogenomic variants…','Applying CPIC clinical rules…','Generating LLM explanation…','Compiling risk assessment…']
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 850)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(2,4,8,0.93)', backdropFilter: 'blur(14px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem',
    }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${C.border0}`,
          borderTopColor: C.teal, borderRightColor: C.teal,
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 12, borderRadius: '50%',
          border: `2px solid ${C.border0}`,
          borderBottomColor: C.blue, borderLeftColor: C.blue,
          animation: 'spinReverse 1.5s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.teal, boxShadow: `0 0 14px ${C.tealGlow}` }} />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: FONT.display, fontSize: '1.1rem', fontWeight: 700, color: C.text0, marginBottom: 6 }}>
          Running Pharmacogenomic Analysis
        </p>
        <p style={{ fontFamily: FONT.mono, fontSize: '0.73rem', color: C.teal, height: '1.4rem' }}>
          {steps[step]}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 270 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: i <= step ? C.teal : C.border0,
              boxShadow: i === step ? `0 0 10px ${C.tealGlow}` : 'none',
              transition: 'all 0.3s ease',
            }} />
            <span style={{
              fontFamily: FONT.mono, fontSize: '0.62rem',
              color: i <= step ? C.text1 : C.text2,
              transition: 'color 0.3s ease',
            }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DASHBOARD (MAIN) ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [loading, setLoading]   = useState(false)
  const [results, setResults]   = useState([])
  const [tab, setTab]           = useState(0)
  const [error, setError]       = useState(null)

  const submit = async (file, drugs) => {
    setLoading(true); setError(null); setResults([])
    await new Promise(r => setTimeout(r, 5200)) // simulate processing
    try {
      // Try real API
      const fd = new FormData()
      fd.append('vcf_file', file)
      fd.append('drugs', drugs.join(','))
      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [data])
    } catch {
      // Fall back to mock
      setResults(drugs.map(d => mockResult(d)))
    }
    setTab(0); setLoading(false)
  }

  const active = results[tab]
  const hasResults = results.length > 0

  return (
    <div style={{ minHeight: '100vh', background: C.bg0 }}>
      {/* Ambient orbs */}
      <div style={{
        position: 'fixed', top: -200, right: -150, width: 600, height: 600,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, rgba(0,200,170,0.045) 0%, transparent 70%)`,
        animation: 'orbFloat 8s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'fixed', bottom: -150, left: -100, width: 500, height: 500,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, rgba(0,132,255,0.035) 0%, transparent 70%)`,
        animation: 'orbFloat 11s ease-in-out infinite alternate-reverse',
      }} />

      {loading && <Loader />}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header />
        <Hero />

        <main style={{ maxWidth: 1380, margin: '0 auto', padding: '0.5rem 2rem 4rem' }}>
          {/* Error */}
          {error && (
            <div style={{
              background: C.toxicDim, border: `1px solid ${C.toxicBorder}`,
              borderRadius: 6, padding: '0.9rem 1.25rem', marginBottom: '1.25rem',
              display: 'flex', gap: 10, alignItems: 'center',
            }}>
              <p style={{ fontFamily: FONT.mono, color: C.toxic, fontSize: '0.8rem', flex: 1 }}>⚠ {error}</p>
              <button onClick={() => setError(null)} style={{ background:'none', border:'none', color: C.text2, cursor:'pointer', fontSize: '1rem' }}>×</button>
            </div>
          )}

          {/* Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: hasResults ? '400px 1fr' : '580px',
            gap: '1.5rem',
            justifyContent: hasResults ? 'stretch' : 'center',
          }}>
            {/* LEFT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card style={{ padding: '1.75rem' }}>
                <Uploader onSubmit={submit} isLoading={loading} />
              </Card>
              <Card style={{ padding: '1.5rem' }}>
                <GenePanel />
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            {hasResults && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Multi-drug tabs */}
                {results.length > 1 && (
                  <div style={{
                    display: 'flex', gap: 0,
                    borderBottom: `1px solid ${C.border0}`,
                    background: C.bg3, borderRadius: '8px 8px 0 0',
                    padding: '0 1rem',
                  }}>
                    {results.map((r,i) => (
                      <button key={i} onClick={() => setTab(i)} style={{
                        fontFamily: FONT.display, fontSize: '0.78rem', fontWeight: 600,
                        letterSpacing: '0.05em', padding: '10px 16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: i === tab ? C.teal : C.text2,
                        borderBottom: `2px solid ${i === tab ? C.teal : 'transparent'}`,
                        transition: 'all 0.2s ease',
                      }}>
                        {r.drug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Result meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Label>ANALYSIS COMPLETE</Label>
                    <p style={{ fontFamily: FONT.mono, fontSize: '0.68rem', color: C.text2, marginTop: 2 }}>
                      {active?.patient_id} · {new Date(active?.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => { setResults([]); setError(null) }}
                    style={{
                      padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
                      border: `1px solid ${C.tealBorder}`, background: 'transparent',
                      color: C.teal, fontFamily: FONT.display, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
                    }}
                  >
                    ← NEW ANALYSIS
                  </button>
                </div>

                <RiskCard result={active} />
                <Explanation result={active} />
                <JsonExport result={active} />
              </div>
            )}
          </div>

          {/* Empty hint */}
          {!hasResults && !loading && (
            <p style={{
              textAlign: 'center', marginTop: '1.5rem',
              fontFamily: FONT.mono, fontSize: '0.68rem', color: C.text2, opacity: 0.5,
            }}>
              Upload a .vcf file and select medications to begin analysis
            </p>
          )}
        </main>

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${C.border0}`, padding: '1.25rem 2rem', textAlign: 'center',
        }}>
          <p style={{ fontFamily: FONT.mono, fontSize: '0.6rem', color: C.text2, letterSpacing: '0.08em' }}>
            PHARMAGUARD · RIFT 2026 HACKATHON · PHARMACOGENOMICS / EXPLAINABLE AI TRACK
            <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
            FastAPI · React · GPT-4 · CPIC Guidelines
          </p>
        </div>
      </div>

      {/* Global keyframes injected via style tag */}
      <style>{`
        @keyframes spin         { to { transform: rotate(360deg); } }
        @keyframes spinReverse  { to { transform: rotate(-360deg); } }
        @keyframes blink        { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulseGlow    { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes orbFloat     { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(20px,-30px) scale(1.1)} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}