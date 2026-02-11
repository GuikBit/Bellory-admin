import axios from 'axios'

function getBaseUrl(): string {
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8081/api'
    // return 'https://api-dev.bellory.com.br/api'
  }
  if (hostname.includes('dev')) {
    return 'https://api-dev.bellory.com.br/api'
  }
  return 'https://api.bellory.com.br/api'
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bellory-admin-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bellory-admin-token')
      localStorage.removeItem('bellory-admin-user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
