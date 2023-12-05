import { Grid, List, ListItem, Typography } from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'

export const PageAbout = () => {
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
            Om Digital Läsesal
          </Typography>
          <List sx={{ listStyleType: 'disc', marginLeft: '20px' }}>
            <ListItem sx={{ display: 'list-item' }}>
              <b>Vilka arkiv finns hos Centrum för Näringslivshistoria?</b>
              <br />
              <a href="/" target="_blank" rel="noreferrer">
                Här finns en lista
              </a>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>Är alla arkiv öppna att använda?</b>
              <br />
              Nej, de flesta kräver tillstånd från det företag eller
              organisation som deponerat sitt historiska material hos oss.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>Hur kan jag få tillstånd att söka i sådana arkiv?</b>
              <br />
              Vi kan hjälpa dig söka tillstånd. Mejla{' '}
              <a href="mailto:bildochfakta@naringslivshistoria.se">
                bildochfakta@naringslivshistoria.se
              </a>{' '}
              och ange vilket arkiv du är intresserad av och varför du vill söka
              i det.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>
                Vilka arkiv är det som är öppet tillgängliga och som jag kan
                söka i direkt med mitt login?
              </b>
              <br />{' '}
              <a href="/" target="_blank">
                Här finns en lista
              </a>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>Vilka är egentligen Centrum för Näringslivshistoria?</b>
              <br />
              <a
                href="https://www.naringslivshistoria.se/om-oss"
                target="_blank"
                rel="noreferrer"
              >
                Här kan du läsa mer om oss
              </a>
            </ListItem>
          </List>
          <Typography variant="body1">
            Frågor om digitala läsesalen kan mejlas till{' '}
            <a href="mailto:info@naringslivshistoria.se">
              info@naringslivshistoria.se
            </a>
            .
          </Typography>
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
