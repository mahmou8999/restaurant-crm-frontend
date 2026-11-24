import { useMemo, useState } from 'react'
import api, { payloadOf } from '../lib/api'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token'))
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })

  const login = async (credentials) => {
    const result = payloadOf(await api.post('/auth/login', credentials))
    const accessToken = result?.token || result?.access_token
    if (!accessToken) throw new Error('استجابة تسجيل الدخول لا تحتوي على رمز دخول.')
    localStorage.setItem('access_token', accessToken)
    if (result.user) localStorage.setItem('user', JSON.stringify(result.user))
    setToken(accessToken)
    setUser(result.user || null)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
