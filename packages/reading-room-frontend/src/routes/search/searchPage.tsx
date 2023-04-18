import { useSearchParams } from 'react-router-dom'
import { Grid } from '@mui/material'
import { useState } from 'react'

import { useAuth } from '../../hooks/useAuth'
import { SearchResult, useSearch } from '.'
import { SearchHeader } from '../../components/searchHeader'

export const PageSearch = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const { token } = useAuth()
  const [page, setPage] = useState<number>(1)
  const pageSize = 20

  const { data, isLoading } = useSearch({ query, startIndex: (page - 1) * pageSize, token })

  return (
    <>
      <SearchHeader></SearchHeader>
      <Grid container sx={{ bgcolor: 'white' }}>
        <Grid item xs={1} />
        <Grid item xs={10} >
          <SearchResult isLoading={isLoading} query={query} documents={data?.results} page={page} pageSize={pageSize} totalHits={(data?.hits ?? 0)} onPageChange={(page: number) => { setPage(page) }} />
        </Grid>
        <Grid item xs={1} />
        </Grid>
    </>
  )
}
