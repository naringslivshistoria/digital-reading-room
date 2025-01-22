import { useEffect, useState } from 'react'
import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
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
import { useIsLoggedIn } from '../../../hooks/useIsLoggedIn'

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
          values: filterParts[1].split('%%'),
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

  useIsLoggedIn(true)

  const createFilterString = () => {
    const filterStrings = Object.keys(filters)
      .map((fieldName) => {
        if (filters[fieldName] && filters[fieldName].values?.length > 0) {
          const filter = filters[fieldName]
          if (filter.values.length === 1 && !filter.values[0]) {
            return null
          }
          return `${filter.fieldName}::${filter.values.join('%%')}`
        } else {
          return null
        }
      })
      .filter((value) => value)

    return filterStrings.join('||')
  }

  const {
    isFetching: filtersLoading,
    data: fieldFilterConfigs,
    refetch: refetchFilters,
  } = useFieldValues({
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
    setQuery(null)
    setFilters({})
    search()
  }

  const clearChildFilter = (fieldName: string) => {
    const childFilter = fieldFilterConfigs?.find((filterConfig) => {
      return fieldName === filterConfig.parentField
    })

    if (childFilter) {
      clearChildFilter(childFilter.fieldName)
      if (filters[childFilter.fieldName]) {
        filters[childFilter.fieldName].values = []
      }
    }
  }

  const updateFilter = async (
    fieldName: string,
    values: string[] | undefined | null
  ) => {
    const valuesArray = !values ? [] : values

    if (!filters[fieldName]) {
      filters[fieldName] = {
        fieldName,
        values: [],
      }
    }
    clearChildFilter(fieldName)
    filters[fieldName].values = valuesArray

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

  const isFieldDisabled = (
    filterConfig: FieldFilterConfig,
    filters: Dictionary<FieldFilter>
  ) => {
    if (!filterConfig.parentField) {
      return false
    } else {
      if (filters[filterConfig.parentField]?.values?.length > 0) {
        return false
      } else {
        return true
      }
    }
  }

  return (
    <>
      {searchEnabled && (
        <>
          <Grid item xs={10} md={6}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box sx={{ flex: 1, width: '100%' }}>
                <TextField
                  variant="outlined"
                  sx={{ width: '100%', bgcolor: 'white' }}
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
                              marginRight: '-13px',
                            }}
                          >
                            <SearchIcon />
                          </IconButton>
                        </Stack>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {fieldFilterConfigs?.find(
                  (f) => f.fieldName === 'attachmentType'
                ) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <FormControl size="small" sx={{ width: '100%' }}>
                      <Select
                        renderValue={(selected) => {
                          if (!selected || selected.length === 0) {
                            return <em>Placeholder</em>
                          }
                          return selected.join(', ')
                        }}
                        defaultValue={
                          Array.isArray(filters['mediaType']?.values)
                            ? filters['mediaType']?.values
                            : []
                        }
                        value={filters['mediaType']?.values ?? ['Mediatyp']}
                        onChange={(e) => {
                          const val =
                            e.target.value === 'string'
                              ? e.target.value.split(';')
                              : (e.target.value as string[])

                          if (val.length > 1 && !val[0]) {
                            val.splice(0, 1)
                          }

                          updateFilter('mediaType', val)
                          search()
                        }}
                        multiple
                        sx={{
                          width: '100%',
                          transition: 'opacity 0.2s',
                        }}
                        inputProps={{
                          style: {
                            padding: '6px 4px',
                          },
                        }}
                        style={{
                          height: '46px',
                        }}
                      >
                        {fieldFilterConfigs
                          ?.find((f) => f.fieldName === 'mediaType')
                          ?.allValues?.map((value: string) => (
                            <MenuItem
                              key={value}
                              value={value}
                              disabled={filtersLoading}
                            >
                              <Checkbox
                                checked={
                                  filters['mediaType']?.values.indexOf(value) >
                                  -1
                                }
                                disabled={filtersLoading}
                              />
                              {fieldFilterConfigs
                                ?.find((f) => f.fieldName === 'mediaType')
                                ?.values?.includes(value) ? (
                                <b>{value}</b>
                              ) : (
                                value
                              )}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setShowHelp(true)
                    }}
                  >
                    <HelpOutlineIcon sx={{ color: '#00AFD8' }} />
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'black',
                        lineHeight: 1,
                        marginLeft: '5px',
                      }}
                    >
                      Söktips
                    </Typography>
                  </IconButton>
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item sm={1}></Grid>
          <Grid item sm={1}></Grid>
          <Grid item xs={8} sm={10}>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  marginTop: 1,
                  '& .MuiGrid-item': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    paddingRight: '8px',
                    '&:last-child': {
                      paddingRight: 0,
                    },
                  },
                }}
              >
                <b>
                  Se vilka arkiv du kan söka i på{' '}
                  <Link to="/min-sida">Min sida</Link>{' '}
                </b>
              </Typography>
            </Box>
            <Box>
              <Grid
                container
                sx={{
                  marginTop: 1,
                  '& .MuiGrid-item': {
                    paddingTop: '4px',
                    paddingBottom: '4px',
                    paddingRight: '8px',
                    '&:last-child': {
                      paddingRight: 0,
                    },
                  },
                }}
              >
                {fieldFilterConfigs &&
                  fieldFilterConfigs
                    .filter((config) => config.fieldName !== 'mediaType')
                    .map((filterConfig: FieldFilterConfig) => {
                      const isDisabled = isFieldDisabled(filterConfig, filters)
                      switch (filterConfig.filterType) {
                        case FilterType.freeText:
                          return (
                            <Grid
                              item
                              key={filterConfig.fieldName}
                              xs={12}
                              md={filterConfig.visualSize}
                            >
                              <Typography
                                sx={{
                                  color: isDisabled
                                    ? 'text.disabled'
                                    : 'text.primary',
                                }}
                              >
                                {filterConfig.displayName}
                              </Typography>
                              <TextField
                                onKeyUp={filterKeyUp}
                                defaultValue={
                                  filters[filterConfig.fieldName]?.values[0]
                                }
                                size="small"
                                disabled={isDisabled}
                                onChange={(e) =>
                                  updateFilter(filterConfig.fieldName, [
                                    e.target.value,
                                  ])
                                }
                                sx={{ width: '100%' }}
                              />
                            </Grid>
                          )
                        case FilterType.values:
                          if (filterConfig.fieldName === 'attachmentType') {
                            return null
                          }
                          return (
                            <Grid
                              item
                              key={filterConfig.fieldName}
                              xs={12}
                              md={filterConfig.visualSize}
                            >
                              <Typography
                                sx={{
                                  color: isDisabled
                                    ? 'text.disabled'
                                    : 'text.primary',
                                }}
                              >
                                {filterConfig.displayName}
                              </Typography>
                              <Select
                                renderValue={(selected) => {
                                  if (!selected || selected.length === 0) {
                                    return <em>Placeholder</em>
                                  }
                                  return selected.join(', ')
                                }}
                                defaultValue={
                                  Array.isArray(
                                    filters[filterConfig.fieldName]?.values
                                  )
                                    ? filters[filterConfig.fieldName]?.values
                                    : []
                                }
                                value={
                                  filters[filterConfig.fieldName]?.values ?? []
                                }
                                size="small"
                                onChange={(e) => {
                                  const val =
                                    e.target.value === 'string'
                                      ? e.target.value.split(';')
                                      : (e.target.value as string[])

                                  if (val.length > 1 && !val[0]) {
                                    val.splice(0, 1)
                                  }

                                  updateFilter(filterConfig.fieldName, val)
                                  search()
                                }}
                                disabled={isDisabled || filtersLoading}
                                multiple
                                sx={{
                                  width: '100%',
                                  opacity: isDisabled ? 0.7 : 1,
                                  transition: 'opacity 0.2s',
                                }}
                                inputProps={{
                                  style: {
                                    padding: '6px 4px',
                                  },
                                }}
                              >
                                {filterConfig.allValues?.map(
                                  (value: string) => (
                                    <MenuItem
                                      key={value}
                                      value={value}
                                      disabled={filtersLoading}
                                    >
                                      <Checkbox
                                        checked={
                                          filters[
                                            filterConfig.fieldName
                                          ]?.values.indexOf(value) > -1
                                        }
                                        disabled={filtersLoading}
                                      />
                                      {filterConfig.values?.includes(value) ? (
                                        <b>{value}</b>
                                      ) : (
                                        value
                                      )}
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </Grid>
                          )
                      }
                    })}
              </Grid>
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
        <DialogTitle variant="h2">Söktips</DialogTitle>
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
