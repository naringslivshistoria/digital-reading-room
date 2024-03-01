import axios from 'axios'
import { useQuery } from 'react-query'

const searchUrl = import.meta.env.VITE_SEARCH_URL || '/api'

export interface IsLoggedInResponse {
  username: string
  depositors?: string[] | null
  archiveInitiators?: string[] | null
  documentIds?: string[] | null
  firstName: string
  lastName: string
  organization: string
}

export const useIsLoggedIn = (enabled: boolean) =>
  useQuery<IsLoggedInResponse>({
    queryKey: ['login'],
    queryFn: async () => {
      const { data } = await axios.get<IsLoggedInResponse>(
        `${searchUrl}/auth/is-logged-in`
      )

      return data
    },
    retry: false,
    // Staletime determines if an actual network query should be performed.
    // Staletime 10 minutes for this hook means the site will "autologout" no
    // more than 10 minutes after the server-side session has expired.
    // Any attempt at search will fail immediately if the server-side session has
    // expired since that hook has staletime 0 and always makes a network call.
    staleTime: 10 * 60 * 1000,
    enabled: enabled,
  })
