import { QueryClient, QueryClientProvider } from 'react-query'
import { Routes, Route } from "react-router-dom"

import { PageSearch } from './pages/page-search'
import { PageLogin } from './pages/login'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<PageSearch />} />
        <Route path="/login" element={<PageLogin />} />
      </Routes>
    </QueryClientProvider>
  )
}

export default App
