import { QueryCache, QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route } from 'react-router-dom'
import { createTheme, Box, CssBaseline, ThemeProvider } from '@mui/material'
import { AxiosError } from 'axios'

import { PageSearch } from './routes/search/searchPage'
import { PageAbout } from './routes/about/aboutPage'
import { PageLogin } from './routes/login/loginPage'
import { DocumentPage } from './routes/document/documentPage'
import CentraleSansRegular from '../assets/CentraleSans-Regular.woff2'
import PublicoTextItalic from '../assets/PublicoText-Italic.woff2'
import { PageReset } from './routes/login/resetPage'
import { MyPage } from './routes/my-page/myPage'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if ((error as AxiosError).response?.status === 401) {
        if (query && query.queryKey && query.queryKey[0] === 'search') {
          location.replace('/login?query=' + query.queryKey[1])
        } else {
          location.replace('/login')
        }
      } else {
        console.log('An error occurred fetching data', error)
      }
    },
  }),
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
    neutral?: PaletteOptions['primary']
  }

  interface Palette {
    neutral: Palette['primary']
  }
}

const mdTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#de3831',
    },
    secondary: {
      main: '#53565a',
    },
    background: {
      default: 'white',
    },
    neutral: {
      main: 'white',
    },
  },
  typography: {
    h1: {
      fontSize: 40,
      fontFamily: 'publicoTextItalic',
      color: 'white',
      fontStyle: 'italic',
    },
    h2: {
      fontSize: 24,
      fontFamily: 'publicoTextItalic',
      fontStyle: 'italic',
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
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: [
          { '@font-face': publicoTextItalic },
          { '@font-face': centraleSans },
        ],
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: 'rgb(83, 86, 90)',
          paddingLeft: '10px',
          textDecoration: 'none',
          textTransform: 'uppercase',
          fontSize: 14,
          fontWeight: 700,
          '&:hover': {
            color: '#de3831',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'rgb(83, 86, 90)',
          textDecoration: 'none',
          fontSize: 14,
          '&:hover': {
            color: '#de3831',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          padding: 5,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderWidth: 1,
        },
      },
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={mdTheme}>
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
            <Route path="/search" element={<PageSearch />} />
            <Route path="/" element={<PageAbout />} />
            <Route path="/om-oss" element={<PageAbout />} />
            <Route path="/min-sida" element={<MyPage />} />
            <Route path="/dokument/:id" element={<DocumentPage />} />
            <Route path="/login/nollstall" element={<PageReset />} />
            <Route path="/login" element={<PageLogin />} />
          </Routes>
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
