import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Container, CircularProgress, Alert, Button } from '@mui/material'

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
      <Container maxWidth="sm" sx={{ marginTop: '50px', textAlign: 'center' }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <Button variant="contained" onClick={() => navigate('/login')}>
          Gå till inloggning
        </Button>
      </Container>
    </>
  )
}
