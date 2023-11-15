import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Typography from '@mui/material/Typography'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export const Search = ({ searchEnabled }: { searchEnabled: boolean }) => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<string | null>(searchParams.get('query'))
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
      {searchEnabled && (
        <>
          <Grid
            item
            xs={8}
            // sm={8}
            md={6}
            sx={{
              paddingRight: { xs: '20px', md: '20px' },
            }}
          >
            <TextField
              variant="filled"
              sx={{ width: { xs: '100%' }, bgcolor: 'white' }}
              placeholder="Sök efter dokument"
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
                  backgroundColor: 'white',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row">
                      {query && (
                        <IconButton
                          onClick={() => clearQuery()}
                          sx={{
                            bgcolor: 'white',
                            height: '44px',
                            width: '44px',
                            borderRadius: 0,
                            '&:hover': { bgcolor: 'white ' },
                          }}
                        >
                          <HighlightOffIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        disableRipple
                        onClick={() => search()}
                        sx={{
                          color: 'white',
                          bgcolor: '#53565a',
                          borderRadius: 0,
                          height: '46px',
                          width: '46px',
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Stack>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item md={4}>
            <Box
              sx={{
                // marginTop: { xs: '0px', sm: '7px' },
                marginLeft: { xs: '-20px', sm: '0px' },
                transform: { xs: 'scale(0.75)', sm: 'scale(1)' },
              }}
            >
              <IconButton
                onClick={() => {
                  setShowHelp(true)
                }}
              >
                <Typography variant="body1" sx={{ color: 'black' }}>
                  <HelpOutlineIcon sx={{ color: '#00AFD8' }} /> Söktips
                </Typography>
              </IconButton>
            </Box>
          </Grid>
        </>
      )}

      <Dialog
        open={showHelp}
        onClose={() => {
          setShowHelp(false)
        }}
      >
        <DialogTitle variant="body1">
          <Typography variant="h2">Söktips</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h3">Enkla uttryck</Typography>
          <Typography variant="body1">
            Du kan använda <i>AND</i> och <i>OR</i> för att kombinera söktermer
            <br />
            Exempel: butik AND annons - båda orden butik och annons måste
            förekomma.
          </Typography>
          <br />
          <Typography variant="h3">Fraser</Typography>
          <Typography variant="body1">
            Använd citattecken för att ange att ord måste komma i följd
            <br />
            Exempel: &quot;svartvitt foto&quot;.
          </Typography>
          <br />
          <Typography variant="h3">Komplexa uttryck</Typography>
          <Typography variant="body1">
            ( och ) används för att skapa grupper av uttryck, som kan kombineras
            med AND och OR.
            <br />
            Exempel: (bil AND parkering) OR (parkeringsgarage) - antingen
            förekommer båda orden bil och parkering, eller så förekommer ordet
            parkeringsgarage.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}
