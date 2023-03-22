import { useState } from 'react'
import { TextField, Button, Alert } from '@mui/material'

import { useAuth } from '../../hooks/useAuth'

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
    <div>
      <div style={{ padding: '30px' }}>
        <h1>Logga in</h1>
        <TextField id="username" onChange={(e) => { setUsername(e.target.value) }} label="Användarnamn" variant="outlined" />
        <TextField id="password" onChange={(e) => { setPassword(e.target.value) }} label="Lösenord" variant="outlined" type="password" />
        <Button variant="outlined" onClick={doLogin}>Logga in</Button>
        { error &&
          <Alert severity="error">Inloggning misslyckades!</Alert>
        }
      </div>
    </div>
  )
}
