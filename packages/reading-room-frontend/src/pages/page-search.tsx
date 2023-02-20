import React, { useState } from 'react'

import { Search, SearchResult, SearchService } from '../features/search'
import { Document } from '../common/types'

import library from '../../assets/library.jpg'

export const PageSearch = () => {
  const[isLoading, setIsLoading] = useState<boolean>(false)
  const[documents, setDocuments] = useState<Document[]>([])

  const onSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 2) {
      setIsLoading(true)
      const documents = (await SearchService.search(e.target.value)).results
      setDocuments(documents)
      setIsLoading(false)
    } else {
      setDocuments([])
    }
  };

  return (
    <div>
      <div style={{ backgroundImage: `url(${library})`, height: "300px", backgroundSize: 'cover', backgroundPosition: 'center', padding: '100px'  }}>
        <Search onChange={onSearchInputChange} placeholder={"Sök efter dokument"} />
      </div>
      <div style={{ padding: '30px' }}>
        <SearchResult isLoading={isLoading} documents={documents} />
      </div>
    </div>
  )
}
