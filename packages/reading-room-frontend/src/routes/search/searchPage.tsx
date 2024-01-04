import { useSearchParams } from 'react-router-dom'
import { Grid } from '@mui/material'
import { useState } from 'react'

import { SearchResult, useSearch } from '.'
import { SiteHeader } from '../../components/siteHeader'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'

export const PageSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('query') ?? undefined
  const filter = searchParams.get('filter') ?? undefined
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance')
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sortOrder') || 'asc'
  )
  const pageSize = 20

  useIsLoggedIn(true)

  const page = Number(searchParams.get('page') ?? 1)

  const { data, isLoading } = useSearch({
    query,
    startIndex: (page - 1) * pageSize,
    filter,
    sort,
    sortOrder,
  })

  const pageChange = (newPage: number) => {
    setSearchParams((currentParams: URLSearchParams) => {
      currentParams.set('page', newPage.toString())
      return currentParams
    })
  }

  const handleSortingChange = (sort: string, sortOrder: string) => {
    setSort(sort)
    setSortOrder(sortOrder)
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
            sort={sort}
            sortOrder={sortOrder}
            onPageChange={pageChange}
            onSorting={handleSortingChange}
          />
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
