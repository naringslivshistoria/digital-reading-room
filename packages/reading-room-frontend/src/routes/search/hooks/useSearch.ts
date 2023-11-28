import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface SearchResponse {
  query: string | undefined | null
  results: Document[]
  hits: number
}

export enum FilterType {
  freeText = 0,
  values = 1,
}

export interface FieldFilterConfig {
  fieldName: string
  parentField?: string
  displayName: string
  filterType: FilterType
  values?: string[]
  allValues?: string[]
}

export interface FieldFilter {
  fieldName: string
  values: string[]
}

const fixSimpleQuery = (query: string | undefined | null) => {
  if (query) {
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
  } else {
    return ''
  }
}

export const useSearch = ({
  query,
  startIndex,
  filter,
}: {
  query: string | undefined | null
  startIndex: number
  filter: string | undefined | null
}) =>
  useQuery<SearchResponse, AxiosError>({
    queryKey: ['search', query, startIndex, filter],
    queryFn: async () => {
      if (query || filter) {
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

export const useFieldValues = ({
  filter,
}: {
  filter: string | undefined | null
}) =>
  useQuery<FieldFilterConfig[], AxiosError>({
    queryFn: async () => {
      const filterparam = filter ? '?filter=' + encodeURIComponent(filter) : ''
      const { data } = await axios.get(
        `${searchUrl}/search/get-field-filters${filterparam}`,
        {
          headers: {
            Accept: 'application/json',
          },
          withCredentials: true,
        }
      )

      return data
    },
    staleTime: Infinity,
  })
