import { QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom"
import { useState, createContext, useContext, Context } from 'react'

import { PageSearch } from './pages/page-search'
import { PageLogin } from './pages/login'
import { AuthProvider, useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navigation />
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <PageSearch />
            </ProtectedRoute>
          }/>
          <Route path="/login" element={<PageLogin />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

const Navigation = () => {
  const { token, onLogout } = useAuth()

  return (
    <nav>
      <NavLink to="/">Home</NavLink>
      <NavLink to="/login">Login</NavLink>

      {token && (
        <button type="button" onClick={onLogout}>
          Sign Out
        </button>
      )}
    </nav>
  )
}

const ProtectedRoute = ({ children } : { children : any }) => {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/home" replace />
  }

  return children;
}

export default App
