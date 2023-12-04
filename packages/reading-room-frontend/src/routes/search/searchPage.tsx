import { useSearchParams } from 'react-router-dom'
import { Grid } from '@mui/material'

import { SearchResult, useSearch } from '.'
import { SiteHeader } from '../../components/siteHeader'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'

export const PageSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('query') ?? undefined
  const filter = searchParams.get('filter') ?? undefined
  const pageSize = 20

  useIsLoggedIn(true)

  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useSearch({
    query,
    startIndex: (page - 1) * pageSize,
    filter,
  })

  const pageChange = (newPage: number) => {
    setSearchParams((currentParams: URLSearchParams) => {
      currentParams.set('page', newPage.toString())
      return currentParams
    })
  }

  return (
    <>
      <SiteHeader />
      <Grid container sx={{ bgcolor: 'white' }} columns={{ xs: 9, sm: 12 }}>
        <Grid item xs={0.5} sm={1} />
        <Grid item xs={8} sm={10}>
          <SearchResult
            isLoading={isLoading}
            query={query}
            filter={filter}
            documents={data?.results}
            page={page}
            pageSize={pageSize}
            totalHits={data?.hits ?? 0}
            onPageChange={pageChange}
          />
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
