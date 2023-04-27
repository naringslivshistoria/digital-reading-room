import { Grid, Typography } from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'

export const PageAbout = () => {
  return (
    <>
    <SiteHeader/>
    <Grid container bgcolor='white'>
        <Grid item xs={1} />
        <Grid item xs={10} sx={{ paddingTop: 10  }} >
          <Typography variant='body2'>
            Här kan du söka i alla de arkiv som är allmänt tillgängliga på Centrum för Näringslivshistoria. Framöver kommer vi lägga till fler arkiv, som vi också sköter om, men som ägs av företagen själva. Tillgång till dessa arkiv kommer behöva godkännande från företagen i fråga.
          </Typography>
          <br/>
          <Typography variant='body2'>
            Den här tjänsten är fortfarande under utveckling. En full lansering planeras till slutet av 2023. Vi tar tacksamt emot synpunkter och förslag på förbättringar till <b><a href='mailto:info@naringslivshistoria.se?subject=Apropå er digitala läsesal'>info@naringslivshistoria.se</a></b>.
          </Typography>
        </Grid>
        <Grid item xs={1} />
    </Grid>
    </>
  )
}
