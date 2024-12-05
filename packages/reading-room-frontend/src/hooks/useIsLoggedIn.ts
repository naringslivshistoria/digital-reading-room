import axios from 'axios'
import { useQuery } from 'react-query'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface IsLoggedInResponse {
  username: string
  depositors?: string[] | null
  archiveInitiators?: string[] | null
  documentIds?: string[] | null
  series?: string[] | null
  volumes?: string[] | null
  fileNames?: string[] | null
  firstName: string
  lastName: string
  organization: string
}

export const useIsLoggedIn = (enabled: boolean) =>
  useQuery<IsLoggedInResponse>({
    queryKey: ['login'],
    queryFn: async () => {
      const { data } = await axios.get<IsLoggedInResponse>(
        `${searchUrl}/auth/is-logged-in`,
        {
          withCredentials: true,
        }
      )
      return data
    },
    retry: false,
    enabled,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
