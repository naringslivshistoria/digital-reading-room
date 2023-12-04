import { useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import { SiteHeader } from '../../components/siteHeader'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const PageLogin = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showReset, setShowReset] = useState(false)
  const [showSent, setShowSent] = useState(false)
  const [showResetError, setShowResetError] = useState(false)
  const [error, setError] = useState<boolean>(false)

  const navigate = useNavigate()

  const doLogin = async () => {
    try {
      const result = await axios(`${backendUrl}/auth/login`, {
        method: 'post',
        data: {
          username,
          password,
        },
      })

      if (result.status === 200) {
        history.replaceState
        navigate('/')
      } else {
        setError(true)
      }
    } catch (error) {
      setError(true)
    }
  }

  const sendResetLink = async () => {
    try {
      const result = await axios(
        `${backendUrl}/auth/send-reset-password-link`,
        {
          method: 'POST',
          data: {
            email: username,
          },
        }
      )

      if (result.status == 200) {
        setShowResetError(false)
        setShowSent(true)
      } else {
        setShowResetError(true)
        setShowSent(false)
      }
    } catch (error) {
      setShowResetError(true)
      setShowSent(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <Grid container bgcolor="white">
        <Grid item xs={1} md={1} />
        <Grid item xs={10} md={5} lg={3} justifyContent="flex-start">
          <Typography
            variant="h2"
            sx={{ marginTop: '40px', marginBottom: '20px' }}
          >
            Välkommen att söka i de digitala arkiven hos Centrum för
            Näringslivshistoria
          </Typography>
          <Typography variant="body1">
            Efter att du loggat in kan du direkt söka i de arkiv som är allmänt
            tillgängliga. Vill du söka i arkiv som kräver tillstånd, mejla
            bildochfakta@naringslivshistoria.se för hjälp med att söka
            tillstånd.
          </Typography>
          <Typography
            variant="h2"
            sx={{ marginTop: '40px', marginBottom: '10px' }}
          >
            Logga in
          </Typography>
          {!showReset && (
            <Stack rowGap={2} justifyContent="flex-start">
              <TextField
                id="username"
                onChange={(e) => {
                  setUsername(e.target.value)
                }}
                value={username}
                label="E-postadress"
                variant="standard"
              />
              <TextField
                id="password"
                onChange={(e) => {
                  setPassword(e.target.value)
                }}
                value={password}
                label="Lösenord"
                variant="standard"
                type="password"
              />
              <Button
                variant="text"
                onClick={doLogin}
                sx={{
                  marginTop: 2,
                  borderRadius: 0,
                  bgcolor: '#53565a',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                Logga in
              </Button>
              <Button
                onClick={() => {
                  setShowReset(!showReset)
                }}
              >
                Glömt lösenord
              </Button>
              {error && (
                <Alert severity="error">Inloggning misslyckades!</Alert>
              )}
            </Stack>
          )}
          {showReset && (
            <Stack rowGap={4} justifyContent="flex-start">
              {' '}
              <TextField
                id="username"
                onChange={(e) => {
                  setUsername(e.target.value)
                }}
                value={username}
                label="Epostadress"
                variant="standard"
              />
              <Button
                variant="text"
                onClick={sendResetLink}
                sx={{
                  marginTop: 2,
                  borderRadius: 0,
                  bgcolor: '#53565a',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                Skicka återställningslänk
              </Button>
              <Button
                onClick={() => {
                  setShowReset(!showReset)
                }}
              >
                Återgå till inloggning
              </Button>
              {showResetError && (
                <Alert severity="error">
                  Ditt lösenord kunde inte återställas. Kontakta supporten för
                  hjälp.
                </Alert>
              )}
              {showSent && (
                <Alert severity="success">
                  Återställningslänk skickad, kontrollera din epost!
                </Alert>
              )}
            </Stack>
          )}
        </Grid>
        <Grid item xs={0} md={5} lg={7}></Grid>
        <Grid item xs={1} md={1} />
      </Grid>
    </>
  )
}
