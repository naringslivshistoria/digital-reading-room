import { QueryCache, QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route, Navigate } from "react-router-dom"
import { createTheme, Box, CssBaseline, ThemeProvider } from '@mui/material'
import { AxiosError } from 'axios'

import { PageSearch } from './routes/search/searchPage'
import { PageAbout } from './routes/about/aboutPage'
import { PageLogin } from './routes/login/loginPage'
import { PageAutoLogin } from './routes/login/autoLoginPage'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { DocumentPage } from './routes/document/documentPage'
import CentraleSansRegular from '../assets/CentraleSans-Regular.woff2'
import PublicoTextItalic from '../assets/PublicoText-Italic.woff2'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: error => {
      if ((error as AxiosError).response?.status === 401) {
        location.replace('/autologin')
      } else {
        console.log('An error occurred fetching data', error)
      }
    }
  })
})

const publicoTextItalic = {
  fontFamily: 'publicoTextItalic',
  fontStyle: 'italic',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    url(${PublicoTextItalic}) format('woff2')
  `,
}

const centraleSans = {
  fontFamily: 'centraleSans',
  fontStyle: 'regular',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    url(${CentraleSansRegular}) format('woff2')
  `,
}

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
      fontSize: 40,
      fontFamily: 'publicoTextItalic',
      color: 'white',
      fontStyle: 'italic'
    },
    h2: {
      fontSize: 24,
      fontFamily: 'publicoTextItalic',
      fontStyle: 'italic'
    },
    h3: {
      fontFamily: 'centraleSans',
      fontSize: 20,
    },
    h4: {
      fontFamily: 'centraleSans',
      fontSize: 14,
      textTransform: 'uppercase',
      color: '#53565a',
      fontWeight: 100,
    },
    body1: {
      fontFamily: 'centraleSans',
      fontSize: 16,
    },
    body2: {
      fontSize: 20,
      fontFamily: 'publicoTextItalic',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: [
          {'@font-face': publicoTextItalic},
          {'@font-face': centraleSans},
        ],
      },
    },
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
              <Route path="/autologin" element={<PageAutoLogin />} />
            </Routes>
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const ProtectedRoute = ({ children } : { children : any }) => {
  const { token } = useAuth()

  if (!token) {
    console.log('ProtectedRoute redirecting to /login')
    return <Navigate to="/login" replace />
  }

  return children;
}

export default App
