import { QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route, Navigate } from "react-router-dom"
import { createTheme, Box, CssBaseline, ThemeProvider } from '@mui/material'

import { PageSearch } from './routes/search/searchPage'
import { PageAbout } from './routes/about/aboutPage'
import { PageLogin } from './routes/login/loginPage'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DocumentPage } from './routes/document/documentPage'

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
  typography: {
    h1: {
      fontSize: 50,
      fontFamily: 'Times new roman',
      color: 'white',
      fontStyle: 'italic'
    },
    h2: {
      fontSize: 28,
      fontFamily: 'Times new roman',
      fontStyle: 'italic'
    },
    h3: {
      fontSize: 20,
    },
    h4: {
      fontSize: 16,
      textTransform: 'uppercase',
      color: '#53565a',
    },
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 28,
      fontFamily: 'Times new roman',
      fontStyle: 'italic'
    }
  }
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
            <Routes>
              <Route path="/search" element={
                <ProtectedRoute>
                  <PageSearch />
                </ProtectedRoute>
              }/>
              <Route path="/" element={
                <ProtectedRoute>
                  <PageAbout />
                </ProtectedRoute>
              }/>
              <Route path="/dokument/:id" element={
                <ProtectedRoute>
                  <DocumentPage />
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

const ProtectedRoute = ({ children } : { children : any }) => {
  const { token } = useAuth()

  console.log('Protected route', token)

  if (!token) {
    console.log('ProtectedRoute redirecting to /login')
    return <Navigate to="/login" replace />
  }

  return children;
}

export default App
