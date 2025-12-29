import axios from 'axios'

// Prefer an explicit backend URL in production; fall back to same-origin.
const backendBase =
  import.meta.env.VITE_BACKEND_URL ||
  (window.location.origin.includes(':5173')
    ? window.location.origin.replace(':5173', ':8000')
    : window.location.origin)

const api = axios.create({
  baseURL: `${backendBase.replace(/\/+$/, '')}/api/v1`,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fx_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fx_token')
    }

    return Promise.reject(error)
  }
)

export default api
