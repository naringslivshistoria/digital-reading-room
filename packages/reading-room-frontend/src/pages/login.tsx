import React, { useState, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

export const PageLogin = () => {
  const { onLogin } = useAuth()
  return (
    <div>
      <div style={{ padding: '30px' }}>
        <div>Logga in</div>
        <button type="button" onClick={onLogin}>
          Sign In
        </button>        
      </div>
    </div>
  )
}
