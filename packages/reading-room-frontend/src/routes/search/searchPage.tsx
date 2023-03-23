import { useEffect, useState } from 'react'

import { Search, SearchResult, useSearch } from '.'
import { useAuth } from '../../hooks/useAuth'
import { SearchHeader } from '../../components/searchHeader'
import { useSearchParams } from 'react-router-dom'

export const PageSearch = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? ''
  const { token } = useAuth()

  const { data, isLoading, refetch } = useSearch({ query, token })

  return (
    <>
      <SearchHeader></SearchHeader>
      <div>
        <div style={{ padding: '30px' }}>
        <SearchResult isLoading={isLoading} documents={data?.results} />
        </div>
      </div>
    </>
  )
}
