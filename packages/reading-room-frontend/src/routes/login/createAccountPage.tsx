import { useEffect, useState } from 'react'
import { TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { SiteHeader } from '../../components/siteHeader'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const CreateAccountPage = () => {
  const [username, setUsername] = useState<string>('')
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [organization, setOrganization] = useState<string>('')
  const [error, setError] = useState<boolean>(false)
  const [duplicateError, setDuplicateError] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<boolean>(false)
  const [emailValidationError, setEmailValidationError] =
    useState<boolean>(false)

  const navigate = useNavigate()

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
  }

  const doCreateAccount = async () => {
    setError(false)
    setDuplicateError(false)

    if (username == '' || firstName == '' || lastName == '') {
      setValidationError(true)
      return
    }

    setValidationError(false)

    try {
      const result = await axios(`${backendUrl}/auth/create-account`, {
        method: 'post',
        data: {
          username,
          firstName,
          lastName,
          organization,
        },
      })

      console.log('result', result)

      //TODO: riktig validering, required-fält, e-post rätt format och samma e-post

      // if (result.status === 200) {
      //   history.replaceState
      //   navigate('/')
      // } else {
      //   setError(true)
      // }
    } catch (error: any) {
      console.log('error', error)
      if (error.response.data.error == 'Username is already in use')
        setDuplicateError(true)
      else setError(true)
    }
  }

  useEffect(() => {
    if (error || validationError) window.scrollTo(0, document.body.scrollHeight)
  }, [error, validationError])

  useEffect(() => {
    if (username && firstName && lastName) setValidationError(false)
  }, [username, firstName, lastName])

  return (
    <>
      <SiteHeader />
      <Grid container bgcolor="white" sx={{ marginBottom: 2 }}>
        <Grid item xs={1} md={1} />
        <Grid item xs={10} md={5} lg={3} justifyContent="flex-start">
          <Typography
            variant="h2"
            sx={{ marginTop: '40px', marginBottom: '20px' }}
          >
            Skapa konto
          </Typography>
          <Typography variant="body1">
            Alla som använder digitala läsesalen behöver skapa ett eget
            (kostnadsfritt) konto för att kunna logga in:
          </Typography>

          <Stack rowGap={2} justifyContent="flex-start">
            <TextField
              id="username"
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              value={username}
              label="E-postadress*"
              variant="standard"
              type="email"
            />
            <TextField
              id="secondUsername"
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              value={username}
              label="E-postadress*"
              variant="standard"
              type="email"
            />
            <TextField
              id="firstName"
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
              value={firstName}
              label="Förnamn*"
              variant="standard"
            />
            <TextField
              id="lastName"
              onChange={(e) => {
                setLastName(e.target.value)
              }}
              value={lastName}
              label="Efternamn*"
              variant="standard"
            />
            <TextField
              id="organization"
              onChange={(e) => {
                setOrganization(e.target.value)
              }}
              value={organization}
              label="Organisation"
              variant="standard"
            />
            <Button
              variant="text"
              onClick={doCreateAccount}
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
              Skapa konto
            </Button>
            <Typography variant="body1">* Obligatoriska fält</Typography>
            {emailValidationError && (
              <Alert severity="warning">
                E-postadressen måste vara en giltig e-postadress
              </Alert>
            )}
            {validationError && (
              <Alert severity="warning">
                För att skapa konto måste du fylla i alla obligatoriska fält:
                <ul>
                  <li>&ndash; E-postadress</li>
                  <li>&ndash; Förnamn</li>
                  <li>&ndash; Efternamn</li>
                </ul>
              </Alert>
            )}
            {error && (
              <Alert severity="error">
                Något gick fel när ditt konto skulle skapas
              </Alert>
            )}
            {duplicateError && (
              <Alert severity="error">
                E-postadressen används redan. Ett nytt konto har inte skapats.
                Använd funktionen för <Link to="/login">Glömt lösenord</Link>{' '}
                för att skapa ett nytt lösenord på ditt befintliga konto
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
