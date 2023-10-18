import { Grid, Stack, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

import header from '../../assets/header.jpg'
import { Search } from '../routes/search'
import cfnLogo from '../../assets/cfn-logo.png'
import { SiteMenu } from './siteMenu'

export const SiteHeader = () => {
  const location = useLocation()

  return (
    <Grid
      container
      direction="row"
      sx={{ height: { xs: '240px', sm: '285px' }, bgcolor: 'primary.main' }}
    >
      <Grid item md={1} xs={1} />
      <Grid item md={6} xs={11}>
        <Grid container>
          <Grid item xs={11} lg={10} sx={{ paddingTop: '20px' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
            >
              <Link to="https://naringslivshistoria.se">
                <Stack direction="row" alignItems="flex-end">
                  <img src={cfnLogo} width="50px" alt="CFN logotyp"></img>
                  <Typography
                    sx={{
                      color: 'white',
                      fontSize: { xs: '12px', sm: '14px' },
                      marginBottom: '-4px',
                      marginLeft: '2px',
                    }}
                  >
                    En tjänst från Centrum för Näringslivshistoria
                  </Typography>
                </Stack>
              </Link>
              {location.pathname !== '/login' && <SiteMenu />}
            </Stack>
            {location.pathname !== '/login' ? (
              <Search searchEnabled={location.pathname !== '/login'} />
            ) : (
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ paddingTop: '72px' }}
              >
                <Link to="/">
                  <Stack direction="row">
                    <Typography
                      variant="h1"
                      sx={{
                        marginBottom: '10px',
                        fontSize: { xs: '27px', sm: '40px' },
                      }}
                    >
                      Digital läsesal
                    </Typography>
                    &nbsp;
                    <Typography
                      variant="h2"
                      sx={{
                        marginTop: { xs: '8px', sm: '12px' },
                        marginLeft: 1,
                        color: 'white',
                        fontSize: { xs: '17px', sm: '24px' },
                      }}
                    >
                      (beta)
                    </Typography>
                  </Stack>
                </Link>
              </Stack>
            )}
          </Grid>
        </Grid>
        <Grid item xs={1} lg={2}></Grid>
      </Grid>
      <Grid
        item
        md={5}
        xs={0}
        style={{
          backgroundColor: 'red',
          backgroundImage: `url(${header})`,
          backgroundSize: 'cover',
        }}
        sx={{ height: '100%' }}
      ></Grid>
    </Grid>
  )
}
