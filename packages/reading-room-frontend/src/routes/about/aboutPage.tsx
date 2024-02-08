import { Grid, List, ListItem, Typography } from '@mui/material'

import { SiteHeader } from '../../components/siteHeader'

export const PageAbout = () => {
  return (
    <>
      <SiteHeader />
      <Grid container sx={{ bgcolor: 'white' }} columns={{ xs: 9, sm: 12 }}>
        <Grid item xs={0.5} sm={1} />
        <Grid item xs={8} sm={6}>
          <Typography
            variant="h2"
            sx={{ marginTop: '40px', marginBottom: '20px' }}
          >
            Om Centrum för Näringslivshistorias digitala läsesal
          </Typography>
          <Typography variant="body1">
            Här kan du söka i det digitala material som finns i våra öppna
            arkiv. Vi har även digitalt material från arkiv som ägs av företag
            och organisationer. För att söka i dessa slutna arkiv behövs
            tillstånd från arkivägaren. Det kan vi hjälpa dig att söka. Oavsett
            behöver alla som använder digitala läsesalen ett eget
            (kostnadsfritt) login, det kan du få genom att mejla&nbsp;
            <a href="mailto:bildochfakta@naringslivshistoria.se?subject=Jag vill ha login">
              bildochfakta@naringslivshistoria.se
            </a>
            .
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2, marginBottom: 4 }}>
            Utöver digitalt material arkiverar vi även fysiskt historiskt
            material åt verksamheter. Vill du söka i det materialet får du
            besöka våra fysiska läsesalar i Bromma och Uppsala.​
          </Typography>
          <Typography variant="h3">Vanliga frågor</Typography>
          <List sx={{ listStyleType: 'disc', marginLeft: '20px' }}>
            <ListItem sx={{ display: 'list-item' }}>
              <b>
                Vilka arkiv finns hos Centrum för Näringslivshistoria, både
                fysiska och digitala?
              </b>
              <br />
              <a
                href="https://www.naringslivshistoria.se/sok-i-arkiven/vart-arkivbestand"
                target="_blank"
                rel="noreferrer"
              >
                Här finns en lista
              </a>
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>
                Hur kan jag få tillstånd att söka i arkiv som kräver deponentens
                godkännande?
              </b>
              <br />
              Vi hjälper dig att söka tillstånd. Mejla{' '}
              <a href="mailto:bildochfakta@naringslivshistoria.se?subject=Jag vill söka tillstånd för ett arkiv">
                bildochfakta@naringslivshistoria.se
              </a>{' '}
              och ange vilket arkiv du är intresserad av och varför du vill söka
              i det.
            </ListItem>
            <ListItem sx={{ display: 'list-item' }}>
              <b>
                Jag vill komma på fysiskt besök till arkiven hos Centrum för
                Näringslivshistoria
              </b>
              <br />{' '}
              <a href="mailto:bildochfakta@naringslivshistoria.se?subject=Jag vill besöka arkiven">
                Kontakta oss här
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
            Andra frågor? Hör av dig till{' '}
            <a href="mailto:info@naringslivshistoria.se">
              info@naringslivshistoria.se
            </a>
            .
          </Typography>
        </Grid>
        <Grid item xs={0.5} sm={5} />
      </Grid>
    </>
  )
}
