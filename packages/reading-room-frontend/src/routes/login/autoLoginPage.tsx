import { useEffect } from 'react'

import { useAuth } from '../../hooks/useAuth'

export const PageAutoLogin = () => {
  const { onLogin } = useAuth()

  useEffect(() => {
    onLogin('dev-team', 'lm-rummet')
  })

  return (
    <>
    </>
  )
}
