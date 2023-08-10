import { useNavigate, useSearchParams } from 'react-router-dom'
import { createContext, useState, useContext, Context } from 'react'
import axios from 'axios'
import Cookies from 'universal-cookie'

const loginUrl =
  import.meta.env.VITE_SEARCH_URL || 'https://search.dev.cfn.iteam.se'

export interface LoginResponse {
  token: string
}

const getToken = async (username: string, password: string) => {
  const { data } = await axios.post<LoginResponse>(
    `${loginUrl}/auth/generate-token`,
    {
      username,
      password,
    }
  )

  return data
}

interface ContextSettings {
  onLogin: (username: string, password: string) => Promise<boolean>
  onLogout: () => Promise<void>
  token: string | null
}

let AuthContext: Context<ContextSettings>

export const AuthProvider = ({ children }: { children: any }) => {
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

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

        const query = searchParams.get('query')

        history.replaceState
        if (query) {
          navigate('/search?query=' + query)
        } else {
          navigate('/')
        }
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
