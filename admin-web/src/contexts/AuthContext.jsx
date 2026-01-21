import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        // Token is loaded from localStorage, user will be loaded from localStorage
        // The API interceptor will add the token to requests dynamically
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            setUser(user)
            
            // Validate token by making a lightweight API call
            // This will trigger the interceptor to clear token if invalid
            try {
              await api.get('/attendance/today')
              // Token is valid, user is already set
            } catch (error) {
              // Token validation failed (401 will be handled by interceptor)
              // If it's not a 401, it's a different error, but token might still be valid
              if (error.response?.status === 401) {
                // Token is invalid, interceptor already cleared it
                setUser(null)
                setToken(null)
              }
            }
          } catch (error) {
            console.error('Error parsing stored user:', error)
            // Clear corrupted data
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setToken(null)
          }
        } else {
          // No user data, clear token
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    
    validateToken()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password })
      const { user, token } = response.data

      setUser(user)
      setToken(token)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      // No need to set api.defaults.headers.common - the interceptor handles it dynamically

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // No need to delete api.defaults.headers.common - interceptor handles it dynamically
  }

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

