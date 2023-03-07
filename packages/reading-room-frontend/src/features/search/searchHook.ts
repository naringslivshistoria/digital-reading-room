import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export interface SearchResponse {
  query: string
  results: Document[]
}

export const useSearch = ({ query }: { query: string}) =>
  useQuery<SearchResponse, AxiosError>({
    queryKey: ['search'], 
    queryFn: async () => {
      if (query) {
        const { data, status } = await axios.get<SearchResponse>(
          `${searchUrl}/search?query=*` + query.replace(' ', '* *') + '*',
          {
            headers: {
              Accept: 'application/json',
            },
          },
        )

        return data
      } else {
        return {
          query: query,
          results: []
        }
      }
    }
  })