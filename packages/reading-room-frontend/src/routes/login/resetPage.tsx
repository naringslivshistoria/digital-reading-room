import { useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import { SiteHeader } from '../../components/siteHeader'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const PageReset = () => {
  const [password, setPassword] = useState<string>('')
  const [password2, setPassword2] = useState<string>('')
  const [showReset, setShowReset] = useState(false)
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [error, setError] = useState<boolean>(false)
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const token = searchParams.get('token') ?? ''

  const doLogin = async () => {
    if (password === password2) {
      try {
        const result = await axios(`${backendUrl}/auth/reset-password`, {
          method: 'post',
          data: {
            email,
            password,
            token,
          },
        })

        if (result.status === 200) {
          setShowReset(true)
        } else {
          setError(true)
        }
      } catch (error) {
        setError(true)
      }
    } else {
      setPasswordMismatch(true)
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
            sx={{ marginTop: '75px', marginBottom: '20px' }}
          >
            Välj ett nytt lösenord
          </Typography>
          <Stack rowGap={4} justifyContent="flex-start">
            <TextField
              id="password"
              onChange={(e) => {
                setPasswordMismatch(false)
                setPassword(e.target.value)
              }}
              value={password}
              label="Lösenord"
              type="password"
              variant="standard"
            />
            <TextField
              id="password2"
              onChange={(e) => {
                setPasswordMismatch(false)
                setPassword2(e.target.value)
              }}
              value={password2}
              label="Upprepa lösenord"
              type="password"
              variant="standard"
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
              Spara nytt lösenord
            </Button>
            {passwordMismatch && (
              <Alert severity="error">Lösenorden matchar inte.</Alert>
            )}
            {error && (
              <Alert severity="error">
                <p>Ändring av lösenord misslyckades.</p>
                <br />
                <p>
                  Din återställningslänk kan ha blivit för gammal. Försök att
                  genomföra återställning igen. Fungerar inte det, kontakta
                  supporten.
                </p>
              </Alert>
            )}
            {showReset && (
              <Alert severity="success">
                Ändring av lösenord genomförd! Du kan nu{' '}
                <Link to="/login">
                  <u>logga in med ditt nya lösenord</u>.
                </Link>
              </Alert>
            )}
          </Stack>
        </Grid>
        <Grid item xs={0} md={5} lg={7}></Grid>
        <Grid item xs={1} md={1} />
      </Grid>
    </>
  )
}
