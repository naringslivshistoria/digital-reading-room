import { Box, Divider, Grid, IconButton, Pagination } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Stack } from '@mui/system'
import { Link } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import AppsIcon from '@mui/icons-material/Apps'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import NoPhotographyIcon from '@mui/icons-material/NoPhotography'
import { useState } from 'react'

import { createGeographyString } from '..'
import { Document } from '../../../common/types'

interface Props {
  documents: Document[] | undefined
  query: string | undefined
  page: number,
  pageSize: number,
  totalHits: number,
  isLoading: boolean,
  onPageChange: (page: number) => void
}

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export function SearchResult({
  query,
  documents,
  page,
  pageSize,
  totalHits,
  onPageChange
}: Props) {
  const [showGrid, setShowGrid] = useState<boolean>(false)

  return (
    <>
    <Stack direction='row' spacing={ 2 } alignItems='flex-end' sx={{ marginTop: '45px', marginBottom: '10px' }}>
      <Typography variant='h2' sx={{ marginBottom: '10px' }}>Sökträffar</Typography>
      <Box sx={{ paddingBottom: 1.3 }}>{ totalHits } träffar</Box>
    </Stack>
    <Divider sx={{ borderColor: 'red' }} />
    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ marginTop: '5px', marginBottom: '5px' }}>
      <Typography variant='h3'>{query}</Typography>
      <Box>
        <IconButton onClick={() => { setShowGrid(true) }}>
          <AppsIcon/>
        </IconButton>
        <IconButton  onClick={() => { setShowGrid(false) }}>
          <FormatListBulletedIcon/>
        </IconButton>
      </Box>
    </Stack>
    <Divider sx={{ borderColor: 'red' }} />
    <Box>
      <Pagination count={Math.ceil((totalHits ?? 0) / pageSize) } defaultPage={page} onChange={(event, page) => { onPageChange(page) }} sx={{ paddingTop: 2, marginBottom: 2 }} siblingCount={4} />
    </Box>
    {! showGrid && documents && documents.map((document) => (
      <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3}} sx={{ marginBottom: '20px' }} key={document.id}>
        <Grid item xs={4} sm={2}>
          <Link to={'/dokument/' + document.id + '?query=' + query} style={{ minWidth: '100%' }}>
              { document.pages[0].thumbnailUrl && (
                <img src={searchUrl + "/thumbnail/" + document.id} style={{  minWidth: '100%', aspectRatio: '1/1', objectFit: 'cover' }} alt=""></img>
              )}
          </Link>
        </Grid>
        <Grid item xs={8} sm={10}>
        <Stack direction='column' width='100%' rowGap={2}>
            <Link to={'/dokument/' + document.id + '?query=' + query }>
              <Typography variant='h3' sx={{ padding: '0px 0 0px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{document.fields.title?.value}</Typography>
              ({document.fields.archiveInitiator?.value})
            </Link>
            <Grid container rowSpacing={{ xs: 1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
              <Grid item md={8} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='h4'>BESKRIVNING</Typography>
                {document.fields.description?.value}
              </Grid>
              <Grid item sm={4}>
                <Typography variant='h4'>ÅRTAL</Typography>
                {document.fields.time?.value}
              </Grid>
              <Grid item xs={0} sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='h4'>GEOGRAFI</Typography>
                {createGeographyString(document)}
              </Grid>
              <Grid item sm={4} sx={{ overflow: 'hidden' }}>
                <Typography variant='h4'>MOTIVID</Typography>
                {document.fields.motiveId?.value}
              </Grid>
              <Grid item sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='h4'>MEDIETYP</Typography>
                <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
                  {document.pages[0].pageType} ({document.fields.format?.value}) <DownloadIcon /><br/>
                  {document.fields.filename?.value}
                </a>
              </Grid>
            </Grid>
          </Stack>
        <Grid/>
      </Grid>
    </Grid>
    ))}
    {showGrid && documents && (
      <Grid container rowSpacing={{ xs: 4, sm: 5, md: 6}} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
        {documents.map((document) => (
          <Grid item xs={6} md={3} xl={12/5} key={`${document.id}-gallery`}>
            <Link to={'/dokument/' + document.id + '?query=' + query}>
              { document.pages[0].thumbnailUrl ? (
                <img src={searchUrl + "/thumbnail/" + document.id} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} alt=""></img>
              ) : (
                <Box>
                  <NoPhotographyIcon/>
                </Box>
              )}
            </Link>
            <Box sx={{ maxHeight: '22px', overflow: 'hidden', fontSize: { xs: '12px', sm: '14px', md: '16px' } }}>
              {document.fields.title?.value}
            </Box>
            <Box sx={{ maxHeight: '22px', overflow: 'hidden', fontSize: { xs: '12px', sm: '14px', md: '16px' } }}>
              {document.fields.archiveInitiator?.value}
            </Box>
          </Grid>
      ))}
      </Grid>
    )}
    <Box>
      <Pagination count={Math.ceil((totalHits ?? 0) / pageSize) } defaultPage={page} onChange={(event, page) => { onPageChange(page) }} sx={{ marginTop: 2, marginBottom: 2 }} siblingCount={4} />
    </Box>
    </>
  )
}