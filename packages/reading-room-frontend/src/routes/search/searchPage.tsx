import { useSearchParams } from 'react-router-dom'
import { Grid } from '@mui/material'

import { useAuth } from '../../hooks/useAuth'
import { SearchResult, useSearch } from '.'
import { SearchHeader } from '../../components/searchHeader'

export const PageSearch = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const { token } = useAuth()

  const { data, isLoading } = useSearch({ query, token })

  return (
    <>
      <SearchHeader></SearchHeader>
      <Grid container>
        <Grid item xs={1} />
        <Grid item xs={10} >
          <SearchResult isLoading={isLoading} query={query} documents={data?.results} />
        </Grid>
        <Grid item xs={1} />
        </Grid>
    </>
  )
}
