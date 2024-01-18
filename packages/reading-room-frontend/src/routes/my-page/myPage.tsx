import { Grid, Typography } from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'

export const MyPage = () => {
  const { data: user } = useIsLoggedIn(true)

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
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 14, sm: 16 },
              marginTop: { xs: '0px', sm: '10px' },
            }}
          >
            <b>Du kan söka i följande arkiv och dokument: </b>
            {user?.depositors
              ?.concat(user?.archiveInitiators || [])
              .concat(user?.documentIds || [])
              .join(', ')}
          </Typography>
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
