import {
  Backdrop,
  Divider,
  IconButton,
  Link,
  Menu,
  MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import LogoutIcon from '@mui/icons-material/Logout'

import { useIsLoggedIn } from '../hooks/useIsLoggedIn'

export const SiteMenu = () => {
  const { data: user } = useIsLoggedIn()

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <>
          <IconButton {...bindTrigger(popupState)} sx={{ padding: 0 }}>
            <MenuIcon sx={{ color: 'white' }} />
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
              <Link href="/api/auth/logout" title="Logga ut">
                <MenuItem onClick={popupState.close}>
                  <LogoutIcon sx={{ marginRight: 0.5 }} />
                  <b style={{ marginTop: 2 }}>Logga ut</b>
                </MenuItem>
              </Link>
            </Menu>
          </Backdrop>
        </>
      )}
    </PopupState>
  )
}
