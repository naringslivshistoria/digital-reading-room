import { useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Stack } from '@mui/system'

import { SiteHeader } from '../../components/siteHeader'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const PageLogin = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
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
            Logga in
          </Typography>
          <Stack rowGap={4} justifyContent="flex-start">
            <TextField
              id="username"
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              value={username}
              label="Användarnamn"
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
            {error && <Alert severity="error">Inloggning misslyckades!</Alert>}
          </Stack>
        </Grid>
        <Grid item xs={0} md={5} lg={7}></Grid>
        <Grid item xs={1} md={1} />
      </Grid>
    </>
  )
}
