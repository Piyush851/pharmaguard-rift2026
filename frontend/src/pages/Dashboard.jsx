import { useState } from 'react'
import { analyzeVCF } from '../services/api'
import VcfUploader from '../components/VcfUploader'
import RiskCard from '../components/RiskCard'
import Explanation from '../components/Explanation'
import JsonExport from '../components/JsonExport'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [targetDrug, setTargetDrug] = useState('')

  const submit = async (file, drugs) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setTargetDrug(drugs[0])

    try {
      const data = await analyzeVCF(file, drugs)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect to API.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* HEADER */}
      <header style={{ width: '100%', borderBottom: '1px solid var(--border-dim)', background: 'rgba(6,13,20,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Pharma<span style={{ color: 'var(--accent-teal)' }}>Guard</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--safe)', boxShadow: '0 0 10px var(--safe)' }} />
            <span className="font-mono" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ width: '100%', maxWidth: '1200px', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '700px' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Precision Medicine <span style={{ color: 'var(--accent-teal)' }}>Risk Prediction</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
            Upload patient VCF genomic data to predict personalized pharmacogenomic risks.
          </p>
        </div>

        {error && (
          <div style={{ width: '100%', background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff1744', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontFamily: 'JetBrains Mono' }}>
            ⚠ ERROR: {error}
          </div>
        )}

        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '2.5rem' }}>
          
          {/* INPUT COLUMN */}
          <div style={{ flex: '1 1 350px', maxWidth: '450px', width: '100%' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
              <VcfUploader onSubmit={submit} isLoading={loading} />
            </div>
          </div>

          {/* RESULTS COLUMN */}
          <div style={{ flex: '2 1 500px', maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div className="dna-loader" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--accent-teal)', fontFamily: 'JetBrains Mono' }}>ANALYZING GENOMIC DATA...</p>
              </div>
            )}
            
            {result && !loading && (
              <>
                <RiskCard result={result} drug={targetDrug} />
                <Explanation result={result} />
                <JsonExport result={result} />
              </>
            )}

            {!result && !loading && (
              <div style={{ height: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-dim)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>AWAITING VCF UPLOAD...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}