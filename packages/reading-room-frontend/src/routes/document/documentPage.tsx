import { Box, Button, Divider, Grid, Stack, Typography } from '@mui/material'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'

import { SearchHeader } from '../../components/searchHeader'
import { useGetDocument } from './hooks/useGetDocument'
import { useAuth } from '../../hooks/useAuth'
import { Document } from '../../common/types'
import { createGeographyString } from '../search'
import noImage from '../../../assets/no-image.png'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export const DocumentPage = () => {
  const { token } = useAuth()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data } = useGetDocument({ id: id ?? '', token })
  const navigate = useNavigate()

  const document = data?.results as Document

  const getFieldValueString = (fieldName: string) => {
    if (!document.fields[fieldName] || !document.fields[fieldName].value || document.fields[fieldName].value === '') {
      return '-'
    } else {
      return document.fields[fieldName].value
    }
  }

  const goBack = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    if (searchParams.get('query')) {
      navigate(-1)
    } else {
      navigate('/search')
    }
  }

  return (
    <>
    <SearchHeader></SearchHeader>
    <Grid container bgcolor='white'>
      <Grid item xs={1} />
      <Grid item xs={10} sx={{ marginBottom: 10 }}>
      { document ? (
      <>
        <Box sx={{ marginTop: 3, marginBottom: 2 }}>
          <Link to='' onClick={goBack}>
            <ChevronLeftIcon sx={{ marginTop: '-2px' }}/> Sökträffar
          </Link>
        </Box>
        <Divider sx={{ borderColor: 'red' }} />
        <Stack direction='row' justifyContent='space-between' alignItems='flex-end' sx={{ padding: '20px 0 20px 0' }}>
          <Box>
            <Typography variant='h3' >{document.fields.title?.value}</Typography>
            ({document.fields.archiveInitiator?.value})
          </Box>
          <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
            <Button variant='text' disableElevation sx={{ color: 'secondary.main', '&:hover': { backgroundColor: 'secondary.main', color: 'white'} }}>
              Ladda ner <DownloadIcon />
            </Button>
          </a>
        </Stack>
        <Box sx={{ marginTop: 1, marginBottom: 5 }}>
          <a href={ `${searchUrl}/document/${document.id}/attachment/${document.fields.filename?.value ?? 'bilaga'}`} target="_blank" rel="noreferrer">
            <img src={document.pages[0].thumbnailUrl ? searchUrl + "/thumbnail/" + document.id : noImage} alt='Liten bild för dokumentet' />
          </a>
        </Box>
        <Stack direction='column' width='100%' rowGap={2}>
          <Grid container rowSpacing={{ xs:1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
            <Grid item sm={8}>
              <Typography variant='h4'>BESKRIVNING</Typography>
              {getFieldValueString('description')}
            </Grid>
            <Grid item xs={12}/>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>ÅRTAL</Typography>
              {getFieldValueString('time')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>GEOGRAFI</Typography>
              {createGeographyString(document)}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>MEDIETYP</Typography>
                {document.pages[0].pageType} ({document.fields.format?.value})<br/>
                {document.fields.filename?.value}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>MOVTIVID</Typography>
              {getFieldValueString('motiveId')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>ORIGINALTEXT</Typography>
              {getFieldValueString('originalText')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>TAGGAR</Typography>
              {getFieldValueString('tags')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>ENGLISH TITLE</Typography>
              {getFieldValueString('englishTitle')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>ENGLISH DESCRIPTION</Typography>
              {getFieldValueString('englishDescription')}
            </Grid>
          </Grid>
          <Typography variant='h3' sx={{ paddingTop: 4, paddingBottom: 2 }}>Övrig information</Typography>
          <Grid container rowSpacing={{ xs:1, sm: 2}} columnSpacing={{ xs:1, sm: 2}}>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>DEPONENT</Typography>
              {getFieldValueString('depositor')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>SERIESIGNUM</Typography>
              {getFieldValueString('seriesSignature')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>SERIE</Typography>
              {getFieldValueString('seriesName')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>VOLYM</Typography>
              {getFieldValueString('volume')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>FÖRVARING/ORDNING</Typography>
              {getFieldValueString('storage')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>MEDIEBÄRARE</Typography>
              {getFieldValueString('mediaCarrier')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>ALBUM</Typography>
              {getFieldValueString('album')}
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>KREATÖR</Typography>
              {getFieldValueString('creator')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>KREATÖR FIRMA</Typography>
              {getFieldValueString('company')}
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>KVARTER</Typography>
              {getFieldValueString('block')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>FASTIGHET</Typography>
              {getFieldValueString('property')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>FÖRSAMLING</Typography>
              {getFieldValueString('parish')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>OMRÅDE MINDRE</Typography>
              {getFieldValueString('areaMinor')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>OMRÅDE STÖRRE</Typography>
              {getFieldValueString('areaMajor')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>KOMMUN</Typography>
              {getFieldValueString('municipality')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>LÄN</Typography>
              {getFieldValueString('region')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>GATA 2</Typography>
              {getFieldValueString('street2')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>GATUNUMMER 2</Typography>
              {getFieldValueString('streetNumber2')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>FASTIGHET 2</Typography>
              {getFieldValueString('property2')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>KVARTER 2</Typography>
              {getFieldValueString('block2')}
            </Grid>
            <Grid item xs={12}>
              <Divider/>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>PUBLICERAD</Typography>
              {getFieldValueString('published')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>RÄTTIGHETER</Typography>
              {getFieldValueString('rights')}
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant='h4'>SPRÅK</Typography>
              {getFieldValueString('language')}
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
