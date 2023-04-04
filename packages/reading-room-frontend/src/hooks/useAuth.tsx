import { useNavigate } from 'react-router-dom'
import { createContext, useState, useContext, Context } from 'react'
import axios from 'axios'
import Cookies from 'universal-cookie'

const loginUrl = import.meta.env.VITE_SEARCH_URL || 'https://search.dev.cfn.iteam.se'
const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN || 'dev.cfn.iteam.se'

export interface LoginResponse {
  token: string
}

const getToken = async (username: string, password: string) => {
  const { data } = await axios.post<LoginResponse>(
    `${loginUrl}/auth/generate-token`,
    {
      username,
      password
    },
  )

  return data
}

interface ContextSettings {
  onLogin: (username: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
  token: string | null
}

let AuthContext : Context<ContextSettings>

export const AuthProvider = ({ children } : { children: any }) => {
  const [token, setToken] = useState<string|null>(null)
  const cookies = new Cookies()
  const navigate = useNavigate()

  const storedToken = localStorage.getItem('token')

  if (!token && storedToken) {
    setToken(storedToken)
  }

  const handleLogin = async (username: string, password: string) => {
    try {
      const { token } = await getToken(username, password)

      if (token) {
        setToken(token)
        localStorage.setItem('token', token)
        // TODO: Do not set cookie from frontend.
        cookies.set('readingroom', token, { path: '/', secure: true, sameSite: 'lax', httpOnly: false, domain: cookieDomain, })
        navigate('/')
        return true
      }
    } catch (error) {
      return false
    }

    return false
  }

  const handleLogout = async () => {
    setToken(null)
    localStorage.removeItem('token')
    navigate('/login')
  }

  const value = {
    token,
    onLogin: handleLogin,
    onLogout: handleLogout,
  }

  AuthContext = createContext<ContextSettings>(value)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
};