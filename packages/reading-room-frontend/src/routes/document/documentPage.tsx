import { Box, Divider, Grid, Stack, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'

import { SearchHeader } from '../../components/searchHeader'
import { useGetDocument } from './hooks/useGetDocument'
import { useAuth } from '../../hooks/useAuth'
import { Document } from '../../common/types'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export const DocumentPage = () => {
  const { token } = useAuth()
  const { id } = useParams()
  const { data } = useGetDocument({ id: id ?? '', token })

  const document = data?.results as Document

  return (
    <>
    <SearchHeader></SearchHeader>
    <Grid container>
      <Grid item sm={1} />
      <Grid item sm={10} sx={{ marginBottom: 10 }}>
    { document ? (
      <>
        <Stack direction='row' spacing={ 2 } alignItems='flex-end'>
          &lt; Sökträffar
        </Stack>
        <Divider sx={{ borderColor: 'red' }} />
        <Typography variant='h2' sx={{ padding: '20px 0 20px 0' }}>{document.fields.title?.value}</Typography>
        { document.pages[0].thumbnailUrl && (
          <Box sx={{ marginBottom: 2 }}>
            <img src={searchUrl + "/thumbnail/" + document.id} alt='Liten bild för dokumentet' />
          </Box>
        )}
        <Stack direction='column' width='100%' rowGap={2}>
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
              {document.fields.city?.value}
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
              </a>
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>SERIE</Typography>
              {document.fields.seriesName?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>KOMMENTAR</Typography>
              {document.fields.comment?.value}
            </Grid>
          </Grid>
          <Grid container>
            <Grid item sm={4}>
              <Typography variant='h4'>SPRÅK</Typography>
              {document.fields.language?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>MOVTIVID</Typography>
              {document.fields.motiveId?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>TAGGAR</Typography>
              {document.fields.tags?.value}
            </Grid>
          </Grid>
        </Stack>
      </>
      ) : (
        <div style={{ padding: '30px' }}>
          Felaktigt dokumentid
        </div>
      )}
        </Grid>
        <Grid item sm={1} />
      </Grid>
    </>
  )
}
