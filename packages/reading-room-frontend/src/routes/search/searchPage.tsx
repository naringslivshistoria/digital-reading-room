import { useSearchParams } from 'react-router-dom'

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
      <SearchResult isLoading={isLoading} query={query} documents={data?.results} />
    </>
  )
}
