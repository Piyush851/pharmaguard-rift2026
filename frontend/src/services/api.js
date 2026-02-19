import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

/**
 * Analyzes a VCF file with given drug names
 * @param {File} vcfFile - The .vcf file
 * @param {string[]} drugs - Array of drug names
 * @returns {Promise<object>} - The analysis result JSON
 */
export async function analyzeVCF(vcfFile, drugs) {
  const formData = new FormData()
  formData.append('vcf_file', vcfFile)
  formData.append('drugs', drugs.join(','))

  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Health check
 */
export async function healthCheck() {
  const response = await api.get('/health')
  return response.data
}

export default api