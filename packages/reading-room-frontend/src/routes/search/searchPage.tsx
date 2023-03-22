import { useEffect, useState } from 'react'
import { Grid } from '@mui/material'
import { Search, SearchResult, useSearch } from '.'
import header from '../../../assets/header.jpg'
import { useAuth } from '../../hooks/useAuth'

export const PageSearch = () => {
  const[query, setQuery] = useState<string>('')
  const { token } = useAuth()

  const { data, isLoading, refetch } = useSearch({ query, token })

  const onSearchInputChange = async (searchQuery: string) => {
    console.log('updating query', searchQuery)
    setQuery(searchQuery)
  }

  useEffect(() => {
    if (query) {
      console.log('searching for', query)
      refetch()
    }
  }, [query, refetch])

  return (
    <>
    <Grid container direction='row' alignItems='center' alignContent="center" sx={{ height: '250px', bgcolor: 'primary.main' }}>
      <Grid item sm={8} xs={12} alignItems='center' alignContent="center">
        <Grid container justifyContent='center'>
          <Grid item sm={8} xs={12} sx={{ padding: '0 10px 0 10px' }}>
            <Search onChange={onSearchInputChange} placeholder={"Sök efter dokument"} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item sm={4} xs={0} style={{ backgroundColor: 'red', backgroundImage: `url(${header})`, backgroundSize: 'cover' }} sx={{ height: '100%' }} >
      </Grid>
    </Grid>
    <div>
      <div style={{ padding: '30px' }}>
        <SearchResult isLoading={isLoading} documents={data?.results} />
      </div>
    </div>
    </>
  )
}
