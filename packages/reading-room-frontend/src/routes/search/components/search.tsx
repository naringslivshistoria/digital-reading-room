import { useState } from 'react'
import { Grid, IconButton, TextField } from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'
import Typography from '@mui/material/Typography'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const Search = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<string|null>(searchParams.get('query'))
  const navigate = useNavigate()

  const search = () => {
    if (query) {
      navigate('/?query=' + query)
    }
  }
  
  const onSubmit = (event: React.KeyboardEvent<HTMLDivElement>) => {
    setQuery((event.target as HTMLInputElement).value)
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      search()
    }
  }

  return (
    <Box>
      <Typography variant='h1' sx={{ marginBottom: '10px' }}>Digital läsesal</Typography>
      <TextField
        variant='filled'
        sx={{ bgcolor: 'background.default', width: { sm: '80%' } }}
        placeholder='Sök efter dokument'
        defaultValue={query}
        type="text"
        onKeyUp={onSubmit}
        autoFocus
        inputProps={{
          style: {
            height: '10px',
          },
        }}
      />
      <IconButton onClick={() => search()} sx={{ color: 'white', bgcolor: '#53565a', borderRadius: 0, height: '43px', width: '43px' }}>
        <SearchIcon/>
      </IconButton>
    </Box>
  );
};