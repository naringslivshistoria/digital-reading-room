import { Box, Divider, Grid, Stack, Typography } from '@mui/material'
import { Link, useParams, useNavigate } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'

import { SearchHeader } from '../../components/searchHeader'
import { useGetDocument } from './hooks/useGetDocument'
import { useAuth } from '../../hooks/useAuth'
import { Document, Field } from '../../common/types'
import { createGeographyString } from '../search'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export const DocumentPage = () => {
  const { token } = useAuth()
  const { id } = useParams()
  const { data } = useGetDocument({ id: id ?? '', token })
  const navigate = useNavigate()

  const document = data?.results as Document

  const getRemainingFields = (document: Document) => {
    const usedFields: string[] = [
      'title',
      'description',
      'motiveId',
      'comment',
      'time',
      'format',
      'filename',
      'archiveInitiator',
      'language',
      'tags',
    ]

    const remainingFields: Field[] = []

    Object.keys(document.fields).forEach((propertyName) => {
      if (!usedFields.includes(propertyName) && document.fields[propertyName].value) {
        remainingFields.push(document.fields[propertyName])
      }
    })

    return remainingFields.sort((a: Field, b: Field) => {
      if (a.originalName > b.originalName) {
        return 1
      } else {
        return -1
      }
    })
  }

  return (
    <>
    <SearchHeader></SearchHeader>
    <Grid container>
      <Grid item xs={1} />
      <Grid item xs={10} sx={{ marginBottom: 10 }}>
      { document ? (
      <>
        <Box sx={{ marginTop: 3, marginBottom: 2 }}>
        <Link to='' onClick={(e) => { e.preventDefault(); navigate(-1) }}>
          &lt; Sökträffar
        </Link>
        </Box>
        <Divider sx={{ borderColor: 'red' }} />
        <Typography variant='h2' sx={{ padding: '20px 0 20px 0' }}>{document.fields.title?.value}</Typography>
        { document.pages[0].thumbnailUrl && (
          <Box sx={{ marginBottom: 2 }}>
            <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
              <img src={searchUrl + "/thumbnail/" + document.id} alt='Liten bild för dokumentet' />
            </a>
            {document.fields.description?.value}
          </Box>
        )}
        <Stack direction='column' width='100%' rowGap={2}>
          <Grid container rowSpacing={{ xs:1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
            <Grid item sm={4}>
              <Typography variant='h4'>ÅRTAL</Typography>
              {document.fields.time?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>GEOGRAFI</Typography>
              {createGeographyString(document)}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>MEDIETYP</Typography>
              <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
                {document.pages[0].pageType} ({document.fields.format?.value}) <DownloadIcon /><br/>
                {document.fields.filename?.value}
              </a>
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>FRÅN</Typography>
              {document.fields.archiveInitiator?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>MOVTIVID</Typography>
              {document.fields.motiveId?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>ORIGINALTEXT</Typography>
              {document.fields.originalText?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>TAGGAR</Typography>
              {document.fields.tags?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>TITLE</Typography>
              {document.fields.englishTitle?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>DESCRIPTION</Typography>
              {document.fields.englishDescription?.value}
            </Grid>
          </Grid>
          <Typography variant='h3'>Övrig information</Typography>
          <Grid container rowSpacing={{ xs:1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
            <Grid item sm={4}>
              <Typography variant='h4'>DEPONENT</Typography>
              {document.fields.depositor?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>SERIESIGNUM</Typography>
              {document.fields.seriesSignature?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>SERIE</Typography>
              {document.fields.seriesName?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>VOLYM</Typography>
              {document.fields.volume?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>FÖRVARING/ORDNING</Typography>
              {document.fields.storage?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>MEDIEBÄRARE</Typography>
              {document.fields.mediaCarrier?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>ALBUM</Typography>
              {document.fields.album?.value}
            </Grid>
            <Grid item sm={12} />
            <Grid item sm={6}>
              <Typography variant='h4'>KREATÖR</Typography>
              {document.fields.creator?.value}
            </Grid>
            <Grid item sm={6}>
              <Typography variant='h4'>KREATÖR FIRMA</Typography>
              {document.fields.company?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>KVARTER</Typography>
              {document.fields.block?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>FASTIGHET</Typography>
              {document.fields.property?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>FÖRSAMLING</Typography>
              {document.fields.parish?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>OMRÅDE MINDRE</Typography>
              {document.fields.areaMinor?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>OMRÅDE STÖRRE</Typography>
              {document.fields.areaMajor?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>KOMMUN</Typography>
              {document.fields.municipality?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>LÄN</Typography>
              {document.fields.region?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>GATA 2</Typography>
              {document.fields.street2?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>GATUNUMMER 2</Typography>
              {document.fields.streetNumber2?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>FASTIGHET 2</Typography>
              {document.fields.property2?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>KVARTER 2</Typography>
              {document.fields.block2?.value}
            </Grid>
            <Grid item sm={12} />
            <Grid item sm={4}>
              <Typography variant='h4'>PUBLICERAD</Typography>
              {document.fields.published?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>RÄTTIGHETER</Typography>
              {document.fields.rights?.value}
            </Grid>
            <Grid item sm={4}>
              <Typography variant='h4'>SPRÅK</Typography>
              {document.fields.language?.value}
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
        <Grid item xs={1} />
      </Grid>
    </>
  )
}
