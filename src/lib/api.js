import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'supportflow.accessToken'
export const AUTH_EXPIRED_EVENT = 'supportflow:auth-expired'

let expirationEventDispatched = false

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    expirationEventDispatched = false
  } else {
    delete config.headers.Authorization
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url ?? ''
    const authorization =
      error.config?.headers?.Authorization ??
      error.config?.headers?.authorization
    const isCredentialRequest = /\/auth\/(login|register)$/.test(requestUrl)

    if (
      error.response?.status === 401 &&
      authorization &&
      !isCredentialRequest &&
      !expirationEventDispatched
    ) {
      expirationEventDispatched = true
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }

    return Promise.reject(error)
  },
)

export default api
