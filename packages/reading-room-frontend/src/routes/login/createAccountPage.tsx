import { useState } from 'react'
import { TextField, Button, Alert, Grid, Typography, Box } from '@mui/material'
import { Link } from 'react-router-dom'
import axios from 'axios'

import { SiteHeader } from '../../components/siteHeader'
import {
  CreateAccountFormData,
  CreateAccountFormErrors,
} from '../../common/types'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const CreateAccountPage = () => {
  const [formData, setFormData] = useState<CreateAccountFormData>({
    username: '',
    secondUsername: '',
    firstName: '',
    lastName: '',
    organization: '',
    password: '',
    retypePassword: '',
  })

  const [errors, setErrors] = useState<CreateAccountFormErrors>({
    username: '',
    secondUsername: '',
    firstName: '',
    lastName: '',
    password: '',
    retypePassword: '',
  })

  const [submitError, setSubmitError] = useState<string>('')
  const [accountCreated, setAccountCreated] = useState(false)

  const validateEmailFormat = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i)
  }

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))

      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }

  const validateForm = (): boolean => {
    const newErrors: CreateAccountFormErrors = {
      username: '',
      secondUsername: '',
      firstName: '',
      lastName: '',
      password: '',
      retypePassword: '',
    }

    let isValid = true

    if (!formData.username) {
      newErrors.username = 'E-postadress krävs'
      isValid = false
    } else if (!validateEmailFormat(formData.username)) {
      newErrors.username = 'Ogiltig e-postadress'
      isValid = false
    }

    if (formData.username !== formData.secondUsername) {
      newErrors.secondUsername = 'E-postadresserna matchar inte'
      isValid = false
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Förnamn krävs'
      isValid = false
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Efternamn krävs'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Lösenord krävs'
      isValid = false
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Lösenordet måste vara minst 8 tecken långt'
      isValid = false
    }

    if (formData.password !== formData.retypePassword) {
      newErrors.retypePassword = 'Lösenorden matchar inte'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    try {
      const result = await axios.post(`${backendUrl}/auth/create-account`, {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organization: formData.organization,
        password: formData.password,
      })

      if (result.status === 200) {
        setAccountCreated(true)
      }
    } catch (error: any) {
      if (error.response?.data?.error === 'Username is already in use') {
        setSubmitError(
          'E-postadressen används redan. Använd funktionen för glömt lösenord för att återställa ditt befintliga konto.'
        )
      } else {
        setSubmitError('Ett fel uppstod när kontot skulle skapas')
      }
    }
  }

  const fields = [
    { field: 'username', label: 'E-postadress*', type: 'email' },
    {
      field: 'secondUsername',
      label: 'Upprepa e-postadress*',
      type: 'email',
    },
    { field: 'firstName', label: 'Förnamn*' },
    { field: 'lastName', label: 'Efternamn*' },
    { field: 'password', label: 'Lösenord*', type: 'password' },
    {
      field: 'retypePassword',
      label: 'Upprepa lösenord*',
      type: 'password',
    },
    { field: 'organization', label: 'Organisation' },
  ]

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

          {accountCreated ? (
            <Typography>
              Ditt nya konto i den digitala läsesalen är nu redo att användas!
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Typography sx={{ mb: 3 }}>
                Alla som använder digitala läsesalen behöver skapa ett eget
                (kostnadsfritt) konto för att kunna logga in:
              </Typography>

              <Grid container spacing={2}>
                {fields.map(({ field, label, type }) => (
                  <Grid item xs={12} key={field}>
                    <TextField
                      fullWidth
                      id={field}
                      name={field}
                      label={label}
                      type={type || 'text'}
                      value={formData[field as keyof typeof formData]}
                      onChange={handleInputChange(field)}
                      error={!!errors[field as keyof CreateAccountFormErrors]}
                      helperText={
                        errors[field as keyof CreateAccountFormErrors]
                      }
                      variant="standard"
                    />
                  </Grid>
                ))}
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="text"
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

              <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                * Obligatoriska fält
              </Typography>

              {submitError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {submitError}
                  {submitError.includes('används redan') && (
                    <Box component="span" sx={{ ml: 1 }}>
                      <Link to="/login">Gå till inloggning</Link>
                    </Box>
                  )}
                </Alert>
              )}
            </Box>
          )}
        </Grid>
        <Grid item xs={0} md={5} lg={7}></Grid>
        <Grid item xs={1} md={1} />
      </Grid>
    </>
  )
}
