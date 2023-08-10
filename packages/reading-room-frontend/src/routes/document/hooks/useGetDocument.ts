import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

import { Document } from '../../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface GetDocumentResponse {
  results: Document | null
}

export const useGetDocument = ({
  id,
  token,
}: {
  id: string
  token: string | null
}) =>
  useQuery<GetDocumentResponse, AxiosError>({
    queryKey: ['getDocument'],
    queryFn: async () => {
      if (id) {
        const { data } = await axios.get<GetDocumentResponse>(
          `${searchUrl}/document/${id}`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: 'Bearer ' + token,
            },
          }
        )

        return data
      } else {
        return {
          results: null,
        }
      }
    },
  })
