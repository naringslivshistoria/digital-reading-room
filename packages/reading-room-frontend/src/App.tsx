import { QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route, NavLink, Navigate } from "react-router-dom"
import { createTheme, Button, Box, CssBaseline, ThemeProvider, AppBar, Toolbar } from '@mui/material'

import { PageSearch } from './routes/search/searchPage'
import { PageLogin } from './routes/login/loginPage'
import { AuthProvider, useAuth } from './hooks/useAuth'

const queryClient = new QueryClient()

declare module '@mui/material/styles' {
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }

  interface Palette {
    neutral: Palette['primary'];
  }
}

const mdTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#de3831'
    },
    secondary: {
      main: '#53565a'
    },
    background: {
      default: 'white'
    },
    neutral: {
      main: 'white'
    }
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
        <NavLink to="/"><Button color="inherit">Hem</Button></NavLink>
        <NavLink to="/login"><Button color="inherit">Logga in</Button></NavLink>

      {token && (
        <Button color="inherit" onClick={onLogout}>
          Logga ut
        </Button>
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
