import { Box, Divider, Grid, IconButton, Pagination } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Stack } from '@mui/system'
import { Link } from 'react-router-dom'
import AppsIcon from '@mui/icons-material/Apps'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import { useState } from 'react'

import { createGeographyString } from '..'
import { Document } from '../../../common/types'
import noImage from '../../../../assets/no-image.png'
import { MetaDataField } from '../../../components/metaDataField'

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
  isLoading,
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
        <IconButton onClick={() => { setShowGrid(true) }} sx={{ color: showGrid ? 'secondary.main' : '#adafaf' }}>
          <AppsIcon/>
        </IconButton>
        <IconButton  onClick={() => { setShowGrid(false) }} sx={{ color: !showGrid ? 'secondary.main' : '#adafaf' }}>
          <FormatListBulletedIcon/>
        </IconButton>
      </Box>
    </Stack>
    <Divider sx={{ borderColor: 'red' }} />
    <Box display='flex' justifyContent='center' sx={{ marginBottom: 2 }}>
      {
        (documents && documents.length > 0) &&
        <Pagination page={page} count={Math.ceil((totalHits ?? 0) / pageSize) } defaultPage={page} onChange={(event, page) => { onPageChange(page) }} sx={{ paddingTop: 2, marginBottom: 2, '& li button': { fontSize: '16px', fontFamily: 'centraleSans' }}} siblingCount={4} />
      }
    </Box>
    {
      (!isLoading && (!documents || documents.length <= 0)) &&
      'Inga sökresultat'
    }
    {! showGrid && documents && documents.map((document) => (
      <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3}} sx={{ marginBottom: '20px', bgcolor: 'white' }} key={document.id}>
        <Grid item xs={4} sm={2}>
          <Link to={'/dokument/' + document.id + '?query=' + query + '&page=' + page} style={{ minWidth: '100%' }}>
            <img
              src={ document.pages[0].thumbnailUrl ? searchUrl + "/thumbnail/" + document.id : noImage } 
              style={{  width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} 
              alt="Tumnagelbild"
              onError={({ currentTarget }) => {
                currentTarget.onerror = null // prevents looping
                currentTarget.src = noImage
              }}
            >
            </img>
          </Link>
        </Grid>
        <Grid item xs={8} sm={10}>
        <Stack direction='column' width='100%' rowGap={2}>
            <Link to={'/dokument/' + document.id + '?query=' + query + '&page=' + page }>
              <Typography variant='h3' sx={{ padding: '0px 0 0px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{document.fields.title?.value !== '' ? document.fields.title?.value : '-'}</Typography>
              ({document.fields.archiveInitiator?.value})
            </Link>
            <Grid container rowSpacing={{ xs: 1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
              <Grid item md={8} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <MetaDataField document={document} heading='BESKRIVNING' fieldName={'description'} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <MetaDataField document={document} heading='ÅRTAL' fieldName={'time'} />
              </Grid>
              <Grid item xs={0} sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='h4'>GEOGRAFI</Typography>
                {createGeographyString(document)}
              </Grid>
              <Grid item xs={12} sm={4} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <MetaDataField document={document} heading='MOTIVID' fieldName={'motiveId'} />
              </Grid>
              <Grid item sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant='h4'>MEDIETYP</Typography>
                  {document.pages[0].pageType} ({document.fields.format?.value})<br/>
                  {document.fields.filename?.value}
              </Grid>
            </Grid>
          </Stack>
        <Grid/>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: '20px' }}>
        <Divider/>
      </Grid>
    </Grid>
    ))}
    {showGrid && documents && (
      <Grid container rowSpacing={{ xs: 4, sm: 5, md: 6}} columnSpacing={{ xs: 1, sm: 2, md: 3}}>
        {documents.map((document) => (
          <Grid item xs={6} md={3} xl={12/5} key={`${document.id}-gallery`}>
            <Link to={'/dokument/' + document.id + '?query=' + query}>
              <img src={ document.pages[0].thumbnailUrl ? searchUrl + "/thumbnail/" + document.id : noImage } style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} alt=""></img>
            </Link>
            <Box sx={{ maxHeight: '22px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: { xs: '14px', sm: '16px' } }}>
              {document.fields.title?.value}
            </Box>
            <Box sx={{ maxHeight: '22px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: { xs: '12px', sm: '14px' } }}>
              ({document.fields.archiveInitiator?.value})
            </Box>
          </Grid>
      ))}
      </Grid>
    )}
    <Box display='flex' justifyContent='center' sx={{ marginBottom: 2 }}>
      {
        (documents && documents.length > 0) &&
        <Pagination page={page} count={Math.ceil((totalHits ?? 0) / pageSize) } defaultPage={page} onChange={(event, page) => { onPageChange(page) }} sx={{ paddingTop: 2, marginBottom: 2, '& li button': { fontSize: '16px', fontFamily: 'centraleSans' }}} siblingCount={4} />
      }
    </Box>
    </>
  )
}