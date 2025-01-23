import { Grid, List, ListItem, Typography } from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'

import { useFieldValues } from '../search/hooks/useSearch'

export const MyPage = () => {
  const { data: user } = useIsLoggedIn(true)
  const { data: fieldValues } = useFieldValues({ filter: null })

  const depositors =
    fieldValues?.find((config) => config.fieldName === 'depositor')
      ?.allValues || []

  const archiveInitiators =
    fieldValues?.find((config) => config.fieldName === 'archiveInitiator')
      ?.allValues || []

  const seriesName =
    fieldValues?.find((config) => config.fieldName === 'seriesName')
      ?.allValues || []

  const volumes =
    fieldValues?.find((config) => config.fieldName === 'volume')?.allValues ||
    []

  return (
    <>
      <SiteHeader />
      <Grid container sx={{ bgcolor: 'white' }} columns={{ xs: 9, sm: 12 }}>
        <Grid item xs={0.5} sm={1} />
        <Grid item xs={8} sm={10}>
          <Typography
            variant="h2"
            sx={{ marginTop: '40px', marginBottom: '20px' }}
          >
            Min sida
          </Typography>
          <Typography variant="body1">
            <b>Användarnamn: </b>
            {user?.username}
          </Typography>
          <Typography variant="body1">
            <b>Namn: </b>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body1">
            <b>Organisation: </b>
            {user?.organization}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 14, sm: 16 },
              marginTop: { xs: '0px', sm: '10px' },
            }}
          >
            <b>Du kan söka i följande arkiv och dokument: </b>
          </Typography>
          <List
            sx={{ listStyleType: 'disc', paddingTop: 0, marginLeft: '20px' }}
          >
            {user?.depositors
              ?.filter((dep) => depositors.includes(dep))
              .concat(
                user?.archiveInitiators?.filter((ai) =>
                  archiveInitiators.includes(ai.split('>').pop() || '')
                ) || []
              )
              .concat(
                user?.series?.filter((s) =>
                  seriesName.includes(s.split('>').pop() || '')
                ) || []
              )
              .concat(
                user?.volumes?.filter((v) =>
                  volumes.includes(v.split('>').pop() || '')
                ) || []
              )
              .concat(user?.documentIds || [])
              .filter((a) => a != '')
              .sort()
              .map((archive) => (
                <ListItem sx={{ display: 'list-item' }} key={archive}>
                  {archive}
                </ListItem>
              ))}
          </List>
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
