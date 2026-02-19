import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export async function analyzeVCF(vcfFile, drugs) {
  const formData = new FormData()
  formData.append('file', vcfFile) 
  formData.append('drug_name', drugs[0]) 

  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function healthCheck() {
  const response = await api.get('/health')
  return response.data
}

export default api