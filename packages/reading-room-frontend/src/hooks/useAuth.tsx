import { useNavigate } from 'react-router-dom'
import { createContext, useState, useContext, Context } from 'react'

const fakeAuth = async () : Promise<string> =>
  new Promise((resolve) => {
    setTimeout(() => resolve('2342f2f1d131rf12'), 250)
  })

interface ContextSettings {
  onLogin: () => Promise<void>
  onLogout: () => Promise<void>
  token: string | null
}

let AuthContext : Context<ContextSettings>

export const AuthProvider = ({ children } : { children: any }) => {
  const [token, setToken] = useState<string|null>(null)
  const navigate = useNavigate()

  const handleLogin = async () => {
    const token = await fakeAuth()

    console.log('setting token', token)

    setToken(token)
    navigate('/')
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