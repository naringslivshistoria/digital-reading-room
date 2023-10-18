import axios, { AxiosError } from 'axios'
import { useQuery } from 'react-query'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface IsLoggedInResponse {
  username: string
  depositors?: string[] | null
  archiveInitiators?: string[] | null
}

export const useIsLoggedIn = () =>
  useQuery<IsLoggedInResponse>({
    queryKey: ['login'],
    queryFn: async () => {
      const { data } = await axios.get<IsLoggedInResponse>(
        `${searchUrl}/auth/is-logged-in`
      )

      return data
    },
    retry: false,
  })
