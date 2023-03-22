import { useState } from 'react'
import { IconButton, TextField } from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'

declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

interface ChangeFunc {
  (query: string) : void
}

interface ISearchProps {
  onChange: ChangeFunc
  placeholder: string
}

export const Search = ({
  onChange,
  placeholder,
}: ISearchProps) => {
  const [query, setQuery] = useState<string|null>(null)

  const search = () => {
    if (query) {
      onChange(query)
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
      <h1>Digital läsesal</h1>
      <TextField
        variant='filled'
        sx={{ bgcolor: 'background.default', width: { sm: '80%' } }}
        placeholder={placeholder}
        type="text"
        onKeyUp={onSubmit}
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