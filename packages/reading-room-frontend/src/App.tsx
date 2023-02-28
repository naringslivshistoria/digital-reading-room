import { QueryClient, QueryClientProvider } from 'react-query'

import { PageSearch } from './pages/page-search'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PageSearch />
    </QueryClientProvider>
  )
}

export default App
