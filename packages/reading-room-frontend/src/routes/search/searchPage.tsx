import { useSearchParams } from 'react-router-dom'
import { Grid } from '@mui/material'

import { useAuth } from '../../hooks/useAuth'
import { SearchResult, useSearch } from '.'
import { SearchHeader } from '../../components/searchHeader'

export const PageSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const { token } = useAuth()
  const pageSize = 20

  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useSearch({ query, startIndex: (page - 1) * pageSize, token })

  const pageChange = (newPage: number) => {
    setSearchParams((currentParams: URLSearchParams) => {
     currentParams.set('page', newPage.toString())
     return currentParams
    })
  }

  return (
    <>
      <SearchHeader></SearchHeader>
      <Grid container sx={{ bgcolor: 'white' }}>
        <Grid item xs={1} />
        <Grid item xs={10} >
          <SearchResult isLoading={isLoading} query={query} documents={data?.results} page={page} pageSize={pageSize} totalHits={(data?.hits ?? 0)} onPageChange={pageChange} />
        </Grid>
        <Grid item xs={1} />
        </Grid>
    </>
  )
}
