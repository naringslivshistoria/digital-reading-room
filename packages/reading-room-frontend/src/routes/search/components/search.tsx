import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Stack, TextField } from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Typography from '@mui/material/Typography'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import cfnLogo from '../../../../assets/cfn-logo.png'

export const Search = ({ searchEnabled }: { searchEnabled: boolean }) => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<string|null>(searchParams.get('query'))
  const [showHelp, setShowHelp] = useState<boolean>(false)
  const navigate = useNavigate()

  const search = () => {
    if (query) {
      navigate('/search?query=' + query)
    }
  }
  
  const clearQuery = () => {
    navigate('.')
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
    <Grid container>
      <Grid item xs={11} lg={10} sx={{ paddingTop: '20px' }}>
        <Link to='https://naringslivshistoria.se'>
          <Stack direction='row' alignItems='flex-end'>
            <img src={cfnLogo} width='50px' alt='CFN logotyp'></img>
            <Typography sx={{ color: 'white', fontSize: { xs: '12px', sm: '14px' }, marginBottom: '-4px', marginLeft: '2px' }}>
              En tjänst från Centrum för Näringslivshistoria
            </Typography>
            </Stack>
        </Link>
        <Stack direction='row' justifyContent='space-between' sx={{ paddingTop: '72px' }}>
          <Link to='/'>
            <Stack direction='row'>
              <Typography variant='h1' sx={{ marginBottom: '10px', fontSize: { xs: '27px', sm: '40px' } }}>Digital läsesal</Typography>
              &nbsp;
              <Typography variant='h2' sx={{ marginTop: { xs: '8px', sm: '12px'}, marginLeft: 1, color: 'white', fontSize: { xs: '17px', sm: '24px' } }}>(beta)</Typography>
            </Stack>
          </Link>
          { searchEnabled &&
            <Box sx={{ marginTop: { xs: '0px', sm: '7px' }, transform: { xs: 'scale(0.75)', sm: 'scale(1)' } }}>
              <IconButton onClick={() => { setShowHelp(true) }}>
                <Typography variant='body1' sx={{ color: 'white' }}>
                  <HelpOutlineIcon/> Söktips
                </Typography>
              </IconButton>
            </Box>
          }
        </Stack>
        { searchEnabled &&
          <TextField
            variant='filled'
            sx={{ width: { xs: '100%' }, bgcolor: 'white' }}
            placeholder='Sök efter dokument'
            defaultValue={query}
            onKeyUp={onSubmit}
            inputProps={{
              style: {
                height: '12px',
                padding: '19px 10px 15px 10px',
                color: 'black',
                backgroundColor: 'white',
              },
            }}
            InputProps={{
              style: {
                backgroundColor: 'white'
              },
              endAdornment: (
                <InputAdornment position="end">
                  <Stack direction='row'>
                    { query && 
                      <IconButton onClick={() => clearQuery()} sx={{ bgcolor: 'white', height: '44px', width: '44px', borderRadius: 0, '&:hover': { bgcolor: 'white '} }}>
                        <HighlightOffIcon />
                      </IconButton>
                    }
                    <IconButton edge="end" disableRipple onClick={() => search()} sx={{ color: 'white', bgcolor: '#53565a', borderRadius: 0, height: '46px', width: '46px' }}>
                      <SearchIcon/>
                    </IconButton>
                  </Stack>
                </InputAdornment>
              ),
            }}
          />
        }
      </Grid>
      <Grid item xs={1} lg={2}>
      </Grid>
    </Grid>

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