import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface GetDocumentResponse {
  results: Document | null
}

export const useGetDocument = ({
  id,
  enabled,
}: {
  id: string
  enabled?: boolean
}) =>
  useQuery<GetDocumentResponse, AxiosError>({
    queryKey: ['getDocument', id],
    queryFn: async () => {
      if (id) {
        const { data } = await axios.get<GetDocumentResponse>(
          `${searchUrl}/document/${id}`,
          {
            headers: {
              Accept: 'application/json',
            },
            withCredentials: true,
          }
        )

        return data
      } else {
        return {
          results: null,
        }
      }
    },
    enabled,
    retry: (failureCount: number, error: AxiosError) => {
      if (error.response?.status === 401) {
        return false
      } else {
        return failureCount <= 1
      }
    },
    refetchOnWindowFocus: false,
  })
