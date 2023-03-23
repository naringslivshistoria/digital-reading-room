import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'

import { Search, useSearch } from '../search'
import header from '../../../assets/header.jpg'
import { useAuth } from '../../hooks/useAuth'
import { SearchHeader } from '../../components/searchHeader'

export const PageAbout = () => {
  return (
    <>
    <SearchHeader></SearchHeader>
    <div>
      <div style={{ padding: '30px' }}>
        Hej hej
      </div>
    </div>
    </>
  )
}
