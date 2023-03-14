import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export interface SearchResponse {
  query: string
  results: Document[]
}

export const useSearch = ({ query, token }: { query: string, token: string | null }) =>
  useQuery<SearchResponse, AxiosError>({
    queryKey: ['search'], 
    queryFn: async () => {
      console.log(query)
      if (query) {
        const { data } = await axios.get<SearchResponse>(
          `${searchUrl}/search?query=*` + query.replace(' ', '* *') + '*',
          {
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + token
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
  