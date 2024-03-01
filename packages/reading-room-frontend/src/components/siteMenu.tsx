import {
  Backdrop,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Link,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import LogoutIcon from '@mui/icons-material/Logout'

import { useIsLoggedIn } from '../hooks/useIsLoggedIn'

export const SiteMenu = () => {
  const isPublicPage =
    location.pathname.startsWith('/login') ||
    location.pathname == '/om-oss' ||
    location.pathname == '/skapa-konto'
  const { data: user } = useIsLoggedIn(!isPublicPage)

  const isLoggedIn = !!user?.username

  return (
    <>
      <Box columnGap={2} sx={{ display: { xs: 'none', sm: 'inline' } }}>
        {isLoggedIn ? (
          <>
            <Link to="/om-oss" component={RouterLink}>
              Om Digital läsesal
            </Link>
            <Link to="/min-sida" component={RouterLink}>
              Min sida
            </Link>
            <Link href="/api/auth/logout">Logga ut</Link>
          </>
        ) : (
          <>
            <Link to="/search" component={RouterLink}>
              Sök i arkiven
            </Link>
            <Link to="/om-oss" component={RouterLink}>
              Om Digital läsesal
            </Link>
            <Link to="/login" component={RouterLink}>
              Logga in
            </Link>
          </>
        )}
      </Box>
      <PopupState variant="popover" popupId="demo-popup-menu">
        {(popupState) => (
          <>
            <IconButton
              {...bindTrigger(popupState)}
              sx={{ padding: 0, display: { xs: 'inline', sm: 'none' } }}
            >
              <MenuIcon sx={{ color: 'rgb(222, 56, 49)' }} />
            </IconButton>
            <Backdrop open={popupState.isOpen} onClick={popupState.close}>
              <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                elevation={0}
                sx={{ top: 0, left: 20 }}
              >
                <IconButton
                  onClick={popupState.close}
                  sx={{ position: 'absolute', top: 5, right: 10 }}
                >
                  <CloseIcon />
                </IconButton>

                {isLoggedIn ? (
                  <Stack>
                    <MenuItem
                      component={'div'}
                      disabled={true}
                      style={{ opacity: 1 }}
                    >
                      <p>
                        <b>Inloggad som:</b>
                        <br />
                        {user?.username}
                      </p>
                    </MenuItem>
                    <Divider
                      sx={{
                        marginLeft: 2,
                        marginRight: 3,
                        paddingTop: 0,
                      }}
                    />
                    <MenuItem
                      component={'div'}
                      disabled={true}
                      style={{ opacity: 1 }}
                    >
                      <div>
                        <b>Tillgängliga arkiv:</b>
                        {user?.depositors &&
                          user.depositors.map((depositor) => (
                            <div key={depositor}>{depositor}</div>
                          ))}
                        {user?.archiveInitiators &&
                          user.archiveInitiators.map((archiveInitiator) => (
                            <div key={archiveInitiator}>{archiveInitiator}</div>
                          ))}
                      </div>
                    </MenuItem>
                    <Divider
                      sx={{
                        marginLeft: 2,
                        marginRight: 3,
                        paddingTop: 0,
                      }}
                    />
                    <Stack
                      sx={{
                        marginTop: 2,
                        marginLeft: 1,
                        paddingTop: 0,
                      }}
                      rowGap={1}
                    >
                      <Link to="/" component={RouterLink}>
                        Om Digital läsesal
                      </Link>
                      <Link to="/min-sida" component={RouterLink}>
                        Min sida
                      </Link>
                      <Link href="/api/auth/logout">
                        <LogoutIcon sx={{ marginRight: 0.5 }} />
                        Logga ut
                      </Link>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack
                    sx={{
                      marginTop: 2,
                      marginLeft: 1,
                      paddingTop: 0,
                    }}
                    rowGap={1}
                  >
                    <Link to="/search" component={RouterLink}>
                      Sök i arkiven
                    </Link>
                    <Link to="/om-oss" component={RouterLink}>
                      Om Digital läsesal
                    </Link>
                    <Link to="/login" component={RouterLink}>
                      Logga in
                    </Link>
                  </Stack>
                )}
              </Menu>
            </Backdrop>
          </>
        )}
      </PopupState>
    </>
  )
}
