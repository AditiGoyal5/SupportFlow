import { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api, { TOKEN_STORAGE_KEY } from '../lib/api.js'
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

  useEffect(() => {
    let active = true
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!token) {
      setLoading(false)
      return () => {
        active = false
      }
    }

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user)
      })
      .catch((error) => {
        if (!active) return

        if (error.response?.status === 401) {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY)
          toast.error('Your session has expired. Please sign in again.')
          return
        }

        toast.error(
          getApiErrorMessage(error, 'Could not verify your session. Please try again.'),
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
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
