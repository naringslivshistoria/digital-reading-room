import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export interface SearchResponse {
  query: string
  results: Document[]
  hits: number
}

const fixSimpleQuery = (query: string) => {
  const queryWords = query.split(' ')
  const fixedWords = queryWords.map((word) => {
    if (['and', 'not', 'or'].includes(word.toLowerCase())) {
      return word.toUpperCase()
    } else if (word.startsWith('"')) {
      return word
    } else {
      return `*${word}*`
    }
  })

  return fixedWords.join(' ')
}

export const useSearch = ({ query, startIndex, token }: { query: string, startIndex: number, token: string | null }) =>
  useQuery<SearchResponse, AxiosError>({
    queryKey: ['search', query, startIndex], 
    queryFn: async () => {
      if (query) {
        const fixedQuery = fixSimpleQuery(query)
        const { data } = await axios.get<SearchResponse>(
          `${searchUrl}/search?query=${fixedQuery}&start=${startIndex}`,
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
          hits: 0,
          results: []
        }
      }
    }
  })
  