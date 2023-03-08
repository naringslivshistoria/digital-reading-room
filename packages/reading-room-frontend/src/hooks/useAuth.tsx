import { useNavigate } from 'react-router-dom'
import { createContext, useState, useContext, Context } from 'react'
import axios, { AxiosError } from 'axios'

const loginUrl = import.meta.env.VITE_LOGIN_URL || 'http://localhost:4001'

export interface LoginResponse {
  token: string
}

const getToken = async (username: string, password: string) => {
  const { data, status } = await axios.post<LoginResponse>(
    `${loginUrl}/auth/generate-token`,
    {
      username,
      password
    },
  )

  return data
}

const fakeAuth = async () : Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => resolve('2342f2f1d131rf12'), 250)
  })

interface ContextSettings {
  onLogin: (username: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
  token: string | null
}

let AuthContext : Context<ContextSettings>

export const AuthProvider = ({ children } : { children: any }) => {
  const [token, setToken] = useState<string|null>(null)
  const navigate = useNavigate()

  const handleLogin = async (username: string, password: string) => {
    try {
      const { token } = await getToken(username, password)

      if (token) {
        setToken(token)
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