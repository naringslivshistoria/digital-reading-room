import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField } from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Typography from '@mui/material/Typography'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export const Search = () => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<string|null>(searchParams.get('query'))
  const [showHelp, setShowHelp] = useState<boolean>(false)
  const navigate = useNavigate()

  const search = () => {
    if (query) {
      navigate('/search?query=' + query)
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
    <>
    <Box sx={{ paddingTop: 10 }}>
      <Stack direction='row' justifyContent='space-between' sx={{ width: '85%' }}>
        <Link to='/'>
          <Typography variant='h1' sx={{ marginBottom: '10px' }}>Digital läsesal</Typography>
        </Link>
        <Box>
          <IconButton onClick={() => { setShowHelp(true) }}>
            <Typography variant='body1' sx={{ color: 'white' }}>
              <HelpOutlineIcon/> Söktips
            </Typography>
          </IconButton>
        </Box>
      </Stack>
      <TextField
        variant='filled'
        sx={{ width: { xs: '80%' } }}
        placeholder='Sök efter dokument'
        defaultValue={query}
        type="string"
        onKeyUp={onSubmit}
        inputProps={{
          style: {
            height: '10px',
            padding: '17px 10px 17px 10px',
            color: 'black',
            backgroundColor: 'white',
          },
        }}
      />
      <IconButton disableRipple onClick={() => search()} sx={{ color: 'white', bgcolor: '#53565a', borderRadius: 0, height: '43px', width: '43px' }}>
        <SearchIcon/>
      </IconButton>
    </Box>
    <Dialog open={showHelp} onClose={() => { setShowHelp(false)}}>
      <DialogTitle variant='body1'>
        <Typography variant='h2'>
          Söktips
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant='h3'>
          Enkla uttryck
        </Typography>
        <Typography variant='body1'>
          Du kan använda <i>AND</i> och <i>OR</i> för att kombinera söktermer<br/>
          Exempel: butik AND annons - båda orden butik och annons måste förekomma.
        </Typography>
        <br/>
        <Typography variant='h3'>
          Fraser
        </Typography>
        <Typography variant='body1'>
          Använd citattecken för att ange att ord måste komma i följd<br/>
          Exempel: &quot;svartvitt foto&quot;.
        </Typography>
        <br/>
        <Typography variant='h3'>
          Komplexa uttryck
        </Typography>
        <Typography variant='body1'>
          ( och ) används för att skapa grupper av uttryck, som kan kombineras med AND och OR.<br/>
          Exempel: (bil AND parkering) OR (parkeringsgarage) - antingen förekommer båda orden bil och parkering, eller så förekommer ordet parkeringsgarage.
        </Typography>
      </DialogContent>
    </Dialog>
    </>
  )
}