import { Grid, Stack, Typography } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

import header from '../../assets/header.jpg'
import { Search } from '../routes/search'
import fullLogo from '../../assets/logo-full.svg'
import { SiteMenu } from './siteMenu'
import { useIsLoggedIn } from '../hooks/useIsLoggedIn'

export const SiteHeader = () => {
  const location = useLocation()
  const isPublicPage =
    location.pathname.startsWith('/login') ||
    location.pathname == '/om-oss' ||
    location.pathname == '/skapa-konto' ||
    location.pathname == '/verifiera-konto'

  const { data: user } = useIsLoggedIn(!isPublicPage)
  const isLoggedIn = !!user?.username

  const searchEnabled =
    isLoggedIn && (location.pathname == '/' || location.pathname == '/search')

  return (
    <>
      <Grid
        container
        direction="row"
        sx={{
          height: { xs: '64px', sm: '75px' },
          paddingLeft: { xs: '20px', md: '0px' },
          paddingRight: '20px',
        }}
        columns={{ xs: 10, sm: 12 }}
        alignItems="center"
      >
        <Grid item sm={1} xs={0} />
        <Grid item xs={9} sm={4}>
          <a href="/">
            <img src={fullLogo} alt="CFN logotyp" width={240} height={40} />
          </a>
        </Grid>
        <Grid item xs={1} sm={6}>
          <Grid
            display={'flex'}
            justifyContent={'flex-end'}
            sx={{
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            {isLoggedIn && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: 12,
                }}
              >
                <b>Inloggad som:</b> {user?.username}
              </Typography>
            )}
          </Grid>
          <Grid item display={'flex'} justifyContent={'flex-end'}>
            <SiteMenu />
          </Grid>
        </Grid>
        <Grid item sm={1} xs={0} />
      </Grid>
      <Grid
        container
        direction="row"
        sx={{ height: { xs: '140px', sm: '200px' }, bgcolor: 'primary.main' }}
      >
        <Grid item sm={1} xs={1} />
        <Grid item sm={6} xs={11}>
          <Grid container>
            <Grid item xs={11} lg={10} sx={{ paddingTop: '20px' }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ paddingTop: { xs: '35px', sm: '60px' } }}
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
                  </Stack>
                </Link>
              </Stack>
            </Grid>
          </Grid>
          <Grid item xs={1} lg={2}></Grid>
        </Grid>
        <Grid
          item
          sm={5}
          xs={0}
          style={{
            backgroundColor: 'red',
            backgroundImage: `url(${header})`,
            backgroundSize: 'cover',
          }}
          sx={{ height: '100%' }}
        ></Grid>
      </Grid>
      {searchEnabled && (
        <>
          <Grid
            container
            direction="row"
            bgcolor={'white'}
            columns={{ xs: 6, sm: 12 }}
            sx={{
              paddingLeft: { xs: '20px', sm: '0px' },
              paddingRight: { xs: '20px', sm: '0px' },
              paddingTop: '20px',
            }}
          >
            <Grid item sm={1} xs={0} />
            <Search searchEnabled={searchEnabled} />
            <Grid item sm={1} xs={0} />
          </Grid>
        </>
      )}
    </>
  )
}
