import React, { useEffect, useState } from 'react'

import { Search, SearchResult, useSearch } from '../features/search'
import { Document } from '../common/types'
import library from '../../assets/library.jpg'
import { useAuth } from '../hooks/useAuth'

export const PageSearch = () => {
  const[query, setQuery] = useState<string>('')
  const { token } = useAuth()

  const { data, isLoading, isFetching, refetch } = useSearch({ query, token })

  const onSearchInputChange = async (searchQuery: string) => {
    console.log('updating query', searchQuery)
    setQuery(searchQuery)
  }

  useEffect(() => {
    if (query) {
      console.log('searching for', query)
      refetch()
    }
  }, [query])

  return (
    <div>
      <div style={{ backgroundImage: `url(${library})`, height: "100px", backgroundSize: 'cover', backgroundPosition: 'center', padding: '20px'  }}>
        <Search onChange={onSearchInputChange} placeholder={"Sök efter dokument"} />
      </div>
      <div style={{ padding: '30px' }}>
        <SearchResult isLoading={isLoading} documents={data?.results} />
      </div>
    </div>
  )
}
