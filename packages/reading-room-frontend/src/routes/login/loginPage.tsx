import { useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Box, Stack } from '@mui/system'

import { useAuth } from '../../hooks/useAuth'
import header from '../../../assets/header.jpg'

export const PageLogin = () => {
  const { onLogin } = useAuth()

  const [username, setUsername] = useState<string>()
  const [password, setPassword] = useState<string>()
  const [error, setError] = useState<boolean>(false)

  const doLogin = async () => {
    if (username && password) {
      setError(false)
      const result = await onLogin(username, password)
      setError(!result)
    }
  }

  return (
    <>
    <Grid container direction='row' alignItems='center' alignContent="center" sx={{ height: '285px', bgcolor: 'primary.main' }}>
      <Grid item sm={1} xs={1} />
      <Grid item sm={6} xs={11} alignItems='center' alignContent="center">
        <Box>
          <Typography variant='h1' sx={{ marginBottom: '10px' }}>Digital läsesal</Typography>
        </Box>
      </Grid>
      <Grid item sm={5} xs={0} style={{ backgroundColor: 'red', backgroundImage: `url(${header})`, backgroundSize: 'cover' }} sx={{ height: '100%' }} >
      </Grid>
    </Grid>
    <Grid container>
      <Grid item xs={1} md={1} />
      <Grid item xs={10} md={5} lg={3} justifyContent='flex-start'>
        <Typography variant='h2' sx={{ marginTop: '30px', marginBottom: '10px' }}>Logga in</Typography>
        <Stack rowGap={2} justifyContent='flex-start' >
          <TextField id="username" onChange={(e) => { setUsername(e.target.value) }} label="Användarnamn" variant="standard" />
          <TextField id="password" onChange={(e) => { setPassword(e.target.value) }} label="Lösenord" variant="standard" type="password" />
          <Button variant="outlined" onClick={doLogin}>Logga in</Button>
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
