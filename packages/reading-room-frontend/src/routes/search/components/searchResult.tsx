import {
  Box,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  Select,
} from '@mui/material'
import Typography from '@mui/material/Typography'
import { Stack } from '@mui/system'
import { Link, useSearchParams } from 'react-router-dom'
import AppsIcon from '@mui/icons-material/Apps'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { useState } from 'react'
import { MoonLoader } from 'react-spinners'

import { Document } from '../../../common/types'
import ArchiveInitiatorFields from './archiveInitatorFields'
import { ThumbnailImage } from './thumbnailImage'

interface Props {
  documents: Document[] | undefined
  query: string | undefined
  filter: string | undefined
  page: number
  pageSize: number
  totalHits: number
  isLoading: boolean
  sort: string
  sortOrder: string
  onPageChange: (page: number) => void
  onSorting: (sort: string, sortOrder: string) => void
}

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export function SearchResult({
  query,
  filter,
  documents,
  page,
  pageSize,
  totalHits,
  isLoading,
  sort,
  sortOrder,
  onPageChange,
  onSorting,
}: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showGrid, setShowGrid] = useState<boolean>(
    searchParams.get('show') === 'grid' ? true : false
  )
  const [enableSortOrder, setEnableSortOrder] = useState(sort != 'relevance')

  const documentUrl = (document: Document) => {
    const pageparam = page ? `&page=${encodeURIComponent(page)}` : ''
    const filterparam = filter ? `&filter=${encodeURIComponent(filter)}` : ''
    const sortparam = sort ? `&sort=${encodeURIComponent(sort)}` : ''
    const sortOrderParam = sortOrder
      ? `&sortOrder=${encodeURIComponent(sortOrder)}`
      : ''
    const showparam = showGrid ? `&show=grid` : ''
    return (
      '/dokument/' +
      document.id +
      '?query=' +
      query +
      pageparam +
      filterparam +
      showparam +
      sortparam +
      sortOrderParam
    )
  }

  const displayGridMode = (grid: boolean) => {
    setShowGrid(grid)
    setSearchParams((currentParams: URLSearchParams) => {
      currentParams.set('show', grid ? 'grid' : 'list')
      return currentParams
    })
  }

  const handleSortChange = (event: any) => {
    onSorting(event.target.value, sortOrder)
    setEnableSortOrder(event.target.value !== 'relevance')
    setSearchParams((currentParams: URLSearchParams) => {
      currentParams.set('sort', event.target.value)
      event.target.value === 'relevance'
        ? currentParams.delete('sortOrder')
        : currentParams.set('sortOrder', sortOrder)
      return currentParams
    })
  }
  const handleSortOrderChange = (event: any) => {
    onSorting(sort, event.target.value)
    setSearchParams((currentParams: URLSearchParams) => {
      currentParams.set('sortOrder', event.target.value)
      return currentParams
    })
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-end"
        sx={{ marginTop: { sm: '45px', xs: '30px' }, marginBottom: '10px' }}
      >
        <Typography variant="h2" sx={{ marginBottom: '10px' }}>
          Sökträffar
        </Typography>
        <Box sx={{ paddingBottom: 1.3 }}>
          {isLoading ? (
            <MoonLoader size="15px" color="#000000" />
          ) : (
            totalHits + ' träffar'
          )}
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'red' }} />
      <Stack
        justifyContent="space-between"
        alignItems="center"
        sx={{
          marginTop: { sm: '5px', xs: '15px' },
          marginBottom: '5px',
          flexDirection: { sm: 'row', xs: 'column' },
        }}
      >
        <Typography variant="h3">{query}</Typography>
        <Stack
          justifyContent="space-between"
          alignItems="center"
          sx={{
            marginTop: '5px',
            marginBottom: '5px',
            flexDirection: { sm: 'row', xs: 'column' },
          }}
        >
          <Box display={'flex'}>
            <Typography
              variant="body1"
              sx={{
                marginTop: 'auto',
                marginBottom: 'auto',
              }}
            >
              Sortering
            </Typography>
            <FormControl sx={{ m: 1, flexGrow: 1, minWidth: 120 }}>
              <Select
                labelId="sort-label"
                value={sort}
                label="Sortera"
                onChange={handleSortChange}
                variant="standard"
              >
                <MenuItem value={'relevance'}>Relevans</MenuItem>
                <MenuItem value={'filename'}>Filnamn</MenuItem>
                <MenuItem value={'title'}>Titel</MenuItem>
                <MenuItem value={'motiveId'}>MotivID</MenuItem>
                <MenuItem value={'tags'}>Taggar</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <Select
                labelId="sortOrder-label"
                value={sortOrder}
                label="Sorteringsordning"
                onChange={handleSortOrderChange}
                disabled={!enableSortOrder}
              >
                <MenuItem value={'asc'}>Stigande</MenuItem>
                <MenuItem value={'desc'}>Fallande</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <IconButton
              onClick={() => {
                displayGridMode(true)
              }}
              sx={{ color: showGrid ? 'secondary.main' : '#adafaf' }}
            >
              <AppsIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                displayGridMode(false)
              }}
              sx={{ color: !showGrid ? 'secondary.main' : '#adafaf' }}
            >
              <FormatListBulletedIcon />
            </IconButton>
          </Box>
        </Stack>
      </Stack>
      <Divider sx={{ borderColor: 'red' }} />
      <Box display="flex" justifyContent="center" sx={{ marginBottom: 2 }}>
        {documents && documents.length > 0 && (
          <Pagination
            page={page}
            count={Math.ceil((totalHits ?? 0) / pageSize)}
            defaultPage={page}
            onChange={(event, page) => {
              onPageChange(page)
            }}
            sx={{
              paddingTop: 2,
              marginBottom: 2,
              '& li button': { fontSize: '16px', fontFamily: 'centraleSans' },
              '.MuiPaginationItem-page': { marginTop: '4px' },
            }}
            siblingCount={4}
            boundaryCount={0}
            showFirstButton={true}
          />
        )}
      </Box>
      {!isLoading &&
        (!documents || documents.length <= 0) &&
        'Inga sökresultat'}
      {!showGrid &&
        documents &&
        documents.map((document) => (
          <Grid
            container
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ marginBottom: '20px', bgcolor: 'white' }}
            key={document.id}
          >
            <Grid item xs={4} sm={2}>
              <Link to={documentUrl(document)} style={{ minWidth: '100%' }}>
                <ThumbnailImage
                  thumbnailUrl={
                    document.pages[0].thumbnailUrl
                      ? `${searchUrl}/document/${document.id}/thumbnail`
                      : null
                  }
                  pageType={document.pages[0].pageType}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                  }}
                />
              </Link>
            </Grid>
            <Grid item xs={8} sm={10}>
              <Stack direction="column" width="100%" rowGap={2}>
                <Link to={documentUrl(document)}>
                  <Typography
                    variant="h3"
                    sx={{
                      padding: '0px 0 0px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {document.fields.title?.value !== ''
                      ? document.fields.title?.value
                      : '-'}
                  </Typography>
                  ({document.fields.archiveInitiator?.value})
                </Link>
                <ArchiveInitiatorFields document={document} />
              </Stack>
              <Grid />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: '20px' }}>
              <Divider />
            </Grid>
          </Grid>
        ))}
      {showGrid && documents && (
        <Grid
          container
          rowSpacing={{ xs: 4, sm: 5, md: 6 }}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          {documents.map((document) => (
            <Grid item xs={6} md={3} xl={12 / 5} key={`${document.id}-gallery`}>
              <Link to={documentUrl(document)}>
                <ThumbnailImage
                  thumbnailUrl={
                    document.pages[0].thumbnailUrl
                      ? `${searchUrl}/document/${document.id}/thumbnail`
                      : null
                  }
                  pageType={document.pages[0].pageType}
                  style={{
                    width: '100%',
                    aspectRatio: '1/1',
                    objectFit: 'cover',
                  }}
                />
              </Link>
              <Box
                sx={{
                  maxHeight: '22px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: { xs: '14px', sm: '16px' },
                }}
              >
                {document.fields.title?.value}
              </Box>
              <Box
                sx={{
                  maxHeight: '22px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: { xs: '12px', sm: '14px' },
                }}
              >
                ({document.fields.archiveInitiator?.value})
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      <Box display="flex" justifyContent="center" sx={{ marginBottom: 2 }}>
        {documents && documents.length > 0 && (
          <Pagination
            page={page}
            count={Math.ceil((totalHits ?? 0) / pageSize)}
            defaultPage={page}
            onChange={(event, page) => {
              onPageChange(page)
            }}
            sx={{
              paddingTop: 2,
              marginBottom: 2,
              '& li button': { fontSize: '16px', fontFamily: 'centraleSans' },
              '.MuiPaginationItem-page': { marginTop: '4px' },
            }}
            siblingCount={4}
            boundaryCount={0}
            showFirstButton={true}
          />
        )}
      </Box>
    </>
  )
}
