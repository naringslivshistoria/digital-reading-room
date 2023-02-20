import axios from 'axios'

import { Document } from '../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export interface SearchResponse {
  query: string
  results: Document[]
}

export const SearchService = {
  search: async (query: string): Promise<SearchResponse> => {
    const { data, status } = await axios.get<SearchResponse>(
      `${searchUrl}/search?query=*` + query.replace(' ', '* *') + '*',
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    return data
  },
}
