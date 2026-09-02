import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './authContextDef'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('aara_token') || null)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aara_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = useCallback((newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    if (newToken) {
      localStorage.setItem('aara_token', newToken)
    } else {
      localStorage.removeItem('aara_token')
    }
    if (userData) {
      localStorage.setItem('aara_user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('aara_user')
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('aara_token')
    localStorage.removeItem('aara_user')
  }, [])

  // Verify and refresh session info on load
  useEffect(() => {
    if (!token) return
    let isMounted = true

    const verifySession = async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (isMounted) {
          if (data.success && data.data) {
            setUser(data.data)
            localStorage.setItem('aara_user', JSON.stringify(data.data))
          } else if (res.status === 401) {
            logout()
          }
        }
      } catch (err) {
        console.warn('Auth session verification error:', err)
      }
    }

    verifySession()
    return () => {
      isMounted = false
    }
  }, [token, logout])

  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [token])

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    getAuthHeaders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
