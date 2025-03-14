import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  CircularProgress,
  Alert,
  Button,
  Grid,
  Typography,
  Box,
} from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api'

export const VerifyAccountPage = () => {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const verifyAccount = async () => {
      if (!email || !token) {
        setError('Saknade verifieringsuppgifter.')
        setLoading(false)
        return
      }

      try {
        const response = await axios.post(`${backendUrl}/auth/verify-account`, {
          username: email,
          verificationToken: token,
        })
        setMessage(response.data.message || 'Kontot är verifierat!')
      } catch (err: any) {
        console.log(err.response.data)
        setError(err.response?.data?.error || 'Verifieringen misslyckades.')
      } finally {
        setLoading(false)
      }
    }
    verifyAccount()
  }, [email, token])

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
            Verifiering av konto
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          {!loading && (
            <Button
              variant="text"
              onClick={() => navigate('/login')}
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
              Gå till inloggning
            </Button>
          )}
        </Grid>
        <Grid item xs={0} md={5} lg={7}></Grid>
        <Grid item xs={1} md={1} />
      </Grid>
    </>
  )
}
