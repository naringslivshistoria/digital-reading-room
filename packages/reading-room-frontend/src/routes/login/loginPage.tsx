import { useEffect, useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Stack } from '@mui/system'

import { useAuth } from '../../hooks/useAuth'
import { SiteHeader } from '../../components/siteHeader'

export const PageLogin = () => {
  const { onLogin } = useAuth()

  const [username, setUsername] = useState<string>('dev-team')
  const [password, setPassword] = useState<string>('lm-rummet')
  const [error, setError] = useState<boolean>(false)

  const doLogin = async () => {
    if (username && password) {
      setError(false)
      const result = await onLogin(username, password)
      setError(!result)
    }
  }

  useEffect(() => {
    doLogin()
  })

  return (
    <>
    <SiteHeader />
    <Grid container bgcolor='white'>
      <Grid item xs={1} md={1} />
      <Grid item xs={10} md={5} lg={3} justifyContent='flex-start'>
        <Typography variant='h2' sx={{ marginTop: '75px', marginBottom: '20px' }}>Logga in</Typography>
        <Stack rowGap={4} justifyContent='flex-start' >
          <TextField id="username" onChange={(e) => { setUsername(e.target.value) }} value={username} label="Användarnamn" variant="standard" />
          <TextField id="password" onChange={(e) => { setPassword(e.target.value) }} value={password} label="Lösenord" variant="standard" type="password" />
          <Button variant="text" onClick={doLogin} sx={{ marginTop: 2, borderRadius: 0, bgcolor: '#53565a', color: 'white', '&:hover': { backgroundColor: 'secondary.main', color: 'white'} }}>Logga in</Button>
          { error &&
            <Alert severity="error">Inloggning misslyckades!</Alert>
          }
        </Stack>
      </Grid>
      <Grid item xs={0} md={5} lg={7}></Grid>
      <Grid item xs={1} md={1}/>
    </Grid>
    </>
  )
}
