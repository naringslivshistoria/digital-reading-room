import { Box, Divider, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import { Stack } from '@mui/system'
import { Link } from 'react-router-dom'

import { Document } from '../../../common/types'

interface Props {
  documents: Document[] | undefined
  query: string | undefined
  isLoading: boolean
}

const comprimaAdapterUrl = import.meta.env.VITE_COMPRIMA_ADAPTER_URL || 'http://localhost:4000'
const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export function SearchResult({
  query,
  documents,
}: Props) {
  return (
    <>
    <Stack direction='row' spacing={ 2 } alignItems='flex-end'>
      <Typography variant='h2' sx={{ marginBottom: '10px' }}>Sökträffar</Typography>
      <Box sx={{ paddingBottom: 1.3 }}>{ documents ? documents.length : 0 } träffar</Box>
    </Stack>
    <Divider sx={{ borderColor: 'red' }} />
    <Typography variant='h3' sx={{ marginBottom: '10px' }}>{query}</Typography>
    <Divider sx={{ borderColor: 'red' }} />
    <Stack rowGap={3} marginTop={3}>
    {documents && documents.map((document) => { 
        return (
          <Stack key={document.id} direction='row' columnGap={3}>
              <Box minWidth={205} display="flex" justifyContent="center" alignContent='flex-start'>
                <Link to={'/dokument?id=' + document.id}>
                  <img src={searchUrl + "/thumbnail/" + document.id} style={{ maxHeight: '205px', maxWidth: '205px'}} alt=""></img>
                </Link>
              </Box>
              <Stack direction='column' width='100%'>
                <Link to={'/dokument?id=' + document.id}>
                  <Typography variant='h3' sx={{ padding: '20px 0 20px 0' }}>{document.fields.title?.value}</Typography>
                </Link>
                <Grid container>
                  <Grid item sm={3}>
                    <Typography variant='h4'>BESKRIVNING</Typography>
                    {document.fields.description?.value}
                  </Grid>
                  <Grid item sm={3}>
                    <Typography variant='h4'>ÅRTAL</Typography>
                    {document.fields.time?.value}
                  </Grid>
                  <Grid item sm={3}>
                    <Typography variant='h4'>GEOGRAFI</Typography>
                    {document.fields.city?.value}
                  </Grid>
                  <Grid item sm={3}>
                   <Typography variant='h4'>FRÅN</Typography>
                   {document.fields.archiveInitiator?.value}
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid item sm={3}>
                    <Typography variant='h4'>MEDIETYP</Typography>
                    {document.fields.format?.value}
                  </Grid>
                  <Grid item sm={3}>
                    <Typography variant='h4'>SERIE</Typography>
                    {document.fields.seriesName?.value}
                  </Grid>
                  <Grid item sm={3}>
                    <Typography variant='h4'>BILAGA</Typography>
                    <a href={comprimaAdapterUrl + "/document/" + document.id + "/attachment"} target="_blank" rel="noreferrer">
                      Öppna
                    </a>
                  </Grid>
                </Grid>
              </Stack>
          </Stack>
        /*
        <tr key={document.id} style={{ height: "40px" }}>
          <td className="border border-slate-300">
            {document.fields.title?.value}
          </td>
          <td className="border border-slate-300">
            {document.fields.archiveInitiator?.value}
          </td>
          <td className="border border-slate-300">
            {document.fields.seriesName?.value}
          </td>
          <td className="border border-slate-300">
            {document.fields.description?.value}
          </td>
          <td className="border border-slate-300">
            {document.fields.time?.value}
          </td>
          <td className="border border-slate-300">
            <a href={comprimaAdapterUrl + "/document/" + document.id + "/attachment"} target="_blank" rel="noreferrer">
              <img src={searchUrl + "/thumbnail/" + document.id} style={{maxHeight: "40px"}} alt=""></img>
            </a>
          </td>
        </tr>*/
    )})}
    </Stack>
    </>
  )
}