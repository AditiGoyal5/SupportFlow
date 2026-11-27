import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { AUTH_EXPIRED_EVENT, TOKEN_STORAGE_KEY } from '../lib/api.js'
import { getApiErrorMessage } from '../lib/api-error.js'

const AuthContext = createContext(null)

function saveAuthResponse(data) {
  if (!data?.token || !data?.user) {
    throw new Error('The server returned an invalid authentication response.')
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
  return data.user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLabel, setLoadingLabel] = useState('Getting things ready for you')

  useEffect(() => {
    let active = true
    const handleAuthExpired = () => {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY)
      setUser(null)
      setLoading(false)
      toast.error('Your session has expired. Please sign in again.')
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    async function initialize() {
      while (active) {
        try {
          await api.get('/health')
          break
        } catch {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 2000)
          })
        }

        if (!active) return
      }

      if (!active) return

      const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!token) {
        setLoading(false)
        return
      }

      setLoadingLabel('Checking your session')

      try {
        const { data } = await api.get('/auth/me')
        if (active) setUser(data.user)
      } catch (error) {
        if (!active || error.response?.status === 401) return

        toast.error(
          getApiErrorMessage(error, 'Could not verify your session. Please try again.'),
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    initialize()

    return () => {
      active = false
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    }
  }, [])

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials)
    setUser(saveAuthResponse(data))
  }

  async function register(details) {
    const { data } = await api.post('/auth/register', details)
    setUser(saveAuthResponse(data))
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loadingLabel,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
