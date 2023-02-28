import React, { useEffect, useState } from 'react'

import { Search, SearchResult, useSearch } from '../features/search'
import { Document } from '../common/types'
import library from '../../assets/library.jpg'

export const PageSearch = () => {
  const[query, setQuery] = useState<string>('')

  const { data, isLoading, isFetching, refetch } = useSearch({ query })

  const onSearchInputChange = async (searchQuery: string) => {
    setQuery(searchQuery)
  }

  useEffect(() => {
    refetch()
  }, [query])

  return (
    <div>
      <div style={{ backgroundImage: `url(${library})`, height: "300px", backgroundSize: 'cover', backgroundPosition: 'center', padding: '100px'  }}>
        <Search onChange={onSearchInputChange} placeholder={"Sök efter dokument"} />
      </div>
      <div style={{ padding: '30px' }}>
        <SearchResult isLoading={isLoading} documents={data?.results} />
      </div>
    </div>
  )
}
