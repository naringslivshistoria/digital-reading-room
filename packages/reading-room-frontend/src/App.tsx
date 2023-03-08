import { QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route, NavLink, useNavigate, Navigate } from "react-router-dom"
import { createTheme, Button, Box, CssBaseline, ThemeProvider, AppBar, Toolbar } from '@mui/material'

import { PageSearch } from './pages/page-search'
import { PageLogin } from './pages/login'
import { AuthProvider, useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

const mdTheme = createTheme({
  palette: {
    mode: 'light',
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={mdTheme}>
        <AuthProvider>
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
              p: 2,
            }}
          >
            <CssBaseline />
            <Navigation />
            <Routes>
              <Route path="/" element={
                <ProtectedRoute>
                  <PageSearch />
                </ProtectedRoute>
              }/>
              <Route path="/login" element={<PageLogin />} />
            </Routes>
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const Navigation = () => {
  const { token, onLogout } = useAuth()

  return (
    <AppBar position="static">
      <Toolbar>
        <NavLink to="/"><Button color="inherit">Home</Button></NavLink>
        <NavLink to="/login"><Button color="inherit">Login</Button></NavLink>

      {token && (
        <Button color onClick={onLogout}>
          Sign Out
        </button>
      )}
      </Toolbar>
    </AppBar>
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
