import { useSearchParams } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { SearchResult, useSearch } from '.'
import { SearchHeader } from '../../components/searchHeader'
import { Grid } from '@mui/material'

export const PageSearch = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const { token } = useAuth()

  const { data, isLoading } = useSearch({ query, token })

  return (
    <>
      <SearchHeader></SearchHeader>
      <Grid container>
        <Grid item sm={1} />
        <Grid item sm={10} >
          <SearchResult isLoading={isLoading} query={query} documents={data?.results} />
        </Grid>
        <Grid item sm={1} />
        </Grid>
    </>
  )
}
