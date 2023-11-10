import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface SearchResponse {
  query: string
  results: Document[]
  hits: number
}

const fixSimpleQuery = (query: string) => {
  const queryWords = query.split(' ')
  const fixedWords = queryWords.map((word) => {
    if (
      word.startsWith('(') ||
      word.startsWith('"') ||
      word.endsWith(')') ||
      word.endsWith('"')
    ) {
      return word
    } else if (['and', 'not', 'or'].includes(word.toLowerCase())) {
      return word.toUpperCase()
    } else {
      return `${word}*`
    }
  })

  return fixedWords.join(' ')
}

export const useSearch = ({
  query,
  startIndex,
  filter,
}: {
  query: string
  startIndex: number
  filter: string | null
}) =>
  useQuery<SearchResponse, AxiosError>({
    queryKey: ['search', query, startIndex],
    queryFn: async () => {
      if (query) {
        const fixedQuery = fixSimpleQuery(query)
        let url = `${searchUrl}/search?query=${fixedQuery}&start=${startIndex}`

        if (filter) {
          url += `&filter=${encodeURIComponent(filter)}`
        }
        const { data } = await axios.get<SearchResponse>(url, {
          headers: {
            Accept: 'application/json',
          },
          withCredentials: true,
        })

        return data
      } else {
        return {
          query: query,
          hits: 0,
          results: [],
        }
      }
    },
    retry: (failureCount: number, error: AxiosError) => {
      if (error.response?.status === 401) {
        return false
      } else {
        return failureCount <= 1
      }
    },
  })

export const useCheckLogin = ({ token }: { token: string | null }) => {
  useQuery({
    queryFn: async () => {
      await axios.get(`${searchUrl}/isloggedin`, {
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + token,
        },
      })
    },
  })
}
