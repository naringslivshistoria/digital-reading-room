import { Box, Divider, Grid, IconButton } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Stack } from '@mui/system'
import { Link } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import AppsIcon from '@mui/icons-material/Apps'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { useState } from 'react'

import { createGeographyString } from '..'
import { Document } from '../../../common/types'

interface Props {
  documents: Document[] | undefined
  query: string | undefined
  isLoading: boolean
}

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export function SearchResult({
  query,
  documents,
}: Props) {
  const [showGrid, setShowGrid] = useState<boolean>(false)

  return (
    <>
    <Stack direction='row' spacing={ 2 } alignItems='flex-end' sx={{ marginTop: '45px', marginBottom: '10px' }}>
      <Typography variant='h2' sx={{ marginBottom: '10px' }}>Sökträffar</Typography>
      <Box sx={{ paddingBottom: 1.3 }}>{ documents ? documents.length : 0 } träffar</Box>
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
    <Stack rowGap={3} marginTop={3}>
      {! showGrid && documents && documents.map((document) => (
        <Stack key={document.id} direction='row' columnGap={3}>
            <Box minWidth={205} height={205} display="flex" justifyContent="center" alignContent='flex-start'>
              <Link to={'/dokument/' + document.id + '?query=' + query}  style={{ width: '100%', height: '100%' }}>
                { document.pages[0].thumbnailUrl && (
                  <img src={searchUrl + "/thumbnail/" + document.id} style={{ maxHeight: '205px', maxWidth: '205px', width: '100%', height:'100%', objectFit: 'cover' }} alt=""></img>
                )}
              </Link>
            </Box>
            <Stack direction='column' width='100%' rowGap={2}>
              <Link to={'/dokument/' + document.id + '?query=' + query }>
                <Typography variant='h3' sx={{ padding: '20px 0 15px 0' }}>{document.fields.title?.value}</Typography>
              </Link>
              <Grid container>
                <Grid item sm={12}>
                  <Typography variant='h4'>BESKRIVNING</Typography>
                  {document.fields.description?.value}
                </Grid>
              </Grid>
              <Grid container>
                <Grid item sm={4}>
                  <Typography variant='h4'>ÅRTAL</Typography>
                  {document.fields.time?.value}
                </Grid>
                <Grid item sm={4}>
                  <Typography variant='h4'>GEOGRAFI</Typography>
                  {createGeographyString(document)}
                </Grid>
                <Grid item sm={4}>
                  <Typography variant='h4'>FRÅN</Typography>
                  {document.fields.archiveInitiator?.value}
                </Grid>
              </Grid>
              <Grid container>
                <Grid item sm={4}>
                  <Typography variant='h4'>MEDIETYP</Typography>
                  <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
                    {document.pages[0].pageType} ({document.fields.format?.value}) <DownloadIcon /><br/>
                    {document.fields.filename?.value}
                  </a>
                </Grid>
                <Grid item sm={4}>
                  <Typography variant='h4'>SERIE</Typography>
                  {document.fields.seriesName?.value}
                </Grid>
              </Grid>
            </Stack>
        </Stack>
      ))}
    {showGrid && documents && (
      <Grid container rowSpacing={10} columnSpacing={3} height={2}>
        {documents.map((document) => (
          <Grid item sm={3} key={`${document.id}-gallery`}>
            <Link to={'/dokument/' + document.id + '?query=' + query}>
              { document.pages[0].thumbnailUrl && (
                <img src={searchUrl + "/thumbnail/" + document.id} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} alt=""></img>
              )}
            </Link>
            <Box sx={{ width: '100%', overflow: 'hidden' }}>
              {document.fields.title?.value}
            </Box>
          </Grid>
      ))}
      </Grid>
    )}
    </Stack>
    </>
  )
}