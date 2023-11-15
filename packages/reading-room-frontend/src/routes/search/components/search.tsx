import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { Box } from '@mui/system'
import SearchIcon from '@mui/icons-material/Search'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Typography from '@mui/material/Typography'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import {
  FieldFilter,
  FieldFilterConfig,
  FilterType,
  useFieldValues,
} from '../hooks/useSearch'
import { Dictionary } from '../../../common/types'

const parseFilter = (
  filterQueryString: string | null | undefined
): Dictionary<FieldFilter> => {
  if (filterQueryString) {
    const filterStrings = filterQueryString.split('||')
    const filters = filterStrings.reduce(
      (
        filters: Dictionary<FieldFilter>,
        filterString: string
      ): Dictionary<FieldFilter> => {
        const filterParts = filterString.split('::')
        filters[filterParts[0]] = {
          fieldName: filterParts[0],
          values: [filterParts[1]],
        }
        return filters
      },
      {}
    )

    return filters
  } else {
    return {}
  }
}

export const Search = ({ searchEnabled }: { searchEnabled: boolean }) => {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<string | null>(searchParams.get('query'))
  const [showHelp, setShowHelp] = useState<boolean>(false)
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Dictionary<FieldFilter>>(
    parseFilter(searchParams.get('filter'))
  )

  const createFilterString = () => {
    const filterStrings = Object.keys(filters).map((fieldName) => {
      const filter = filters[fieldName]
      return `${filter.fieldName}::${filter.values.join('%%')}`
    })

    return filterStrings.join('||')
  }

  const { data: fieldFilterConfigs, refetch: refetchFilters } = useFieldValues({
    filter: createFilterString(),
  })

  const search = () => {
    navigate(
      '/search?query=' +
        (query ? query : '') +
        (filters ? '&filter=' + encodeURIComponent(createFilterString()) : '')
    )
  }

  const clearQuery = () => {
    navigate('.')
  }

  const updateFilter = async (
    fieldName: string,
    value: string | undefined | null
  ) => {
    if (value) {
      if (filters[fieldName]) {
        filters[fieldName].values = [value]
      } else {
        filters[fieldName] = {
          fieldName,
          values: [value],
        }
      }
    } else {
      delete filters[fieldName]
    }

    const newFilters: Dictionary<FieldFilter> = { ...filters }

    setFilters(newFilters)
  }

  useEffect(() => {
    const updateFilters = async () => {
      await refetchFilters()
    }

    updateFilters()
  }, [filters, refetchFilters])

  const filterKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      search()
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
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ paddingTop: '72px' }}
      >
        <Link to="/">
          <Stack direction="row">
            <Typography
              variant="h1"
              sx={{
                marginBottom: '10px',
                fontSize: { xs: '27px', sm: '40px' },
              }}
            >
              Digital läsesal
            </Typography>
            &nbsp;
            <Typography
              variant="h2"
              sx={{
                marginTop: { xs: '8px', sm: '12px' },
                marginLeft: 1,
                color: 'white',
                fontSize: { xs: '17px', sm: '24px' },
              }}
            >
              (beta)
            </Typography>
          </Stack>
        </Link>
        {searchEnabled && (
          <Box
            sx={{
              marginTop: { xs: '0px', sm: '7px' },
              transform: { xs: 'scale(0.75)', sm: 'scale(1)' },
            }}
          >
            <IconButton
              onClick={() => {
                setShowHelp(true)
              }}
            >
              <Typography variant="body1" sx={{ color: 'white' }}>
                <HelpOutlineIcon /> Söktips
              </Typography>
            </IconButton>
          </Box>
        )}
      </Stack>
      {searchEnabled && (
        <>
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
          <Box bgcolor={'white'}>
            <Grid container>
              {fieldFilterConfigs &&
                fieldFilterConfigs.map((filterConfig: FieldFilterConfig) => {
                  switch (filterConfig.filterType) {
                    case FilterType.freeText:
                      return (
                        <Grid key={filterConfig.fieldName}>
                          <Typography>{filterConfig.displayName}</Typography>
                          <TextField
                            onKeyUp={filterKeyUp}
                            defaultValue={
                              filters[filterConfig.fieldName]?.values[0]
                            }
                            onChange={(e) =>
                              updateFilter(
                                filterConfig.fieldName,
                                e.target.value
                              )
                            }
                          ></TextField>
                        </Grid>
                      )
                    case FilterType.values:
                      return (
                        <Grid key={filterConfig.fieldName}>
                          <Typography>{filterConfig.displayName}</Typography>
                          <Select
                            defaultValue={
                              filters[filterConfig.fieldName]?.values[0]
                            }
                            placeholder={'Välj ' + filterConfig.displayName}
                            onChange={(e) => {
                              updateFilter(
                                filterConfig.fieldName,
                                e.target.value as string | undefined
                              )
                              search()
                            }}
                          >
                            <MenuItem key={0} value={undefined}>
                              Alla
                            </MenuItem>
                            {filterConfig.values?.map((value: string) => (
                              <MenuItem key={value} value={value}>
                                {value}
                              </MenuItem>
                            ))}
                          </Select>
                        </Grid>
                      )
                  }
                })}
            </Grid>
          </Box>
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
