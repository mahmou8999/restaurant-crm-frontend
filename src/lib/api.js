import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export const payloadOf = (response) => response?.data?.data ?? response?.data
export const listOf = (value) => {
  const data = value?.data ?? value
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}
export const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error || 'حصل خطأ، حاول مرة تانية.'

export default api
