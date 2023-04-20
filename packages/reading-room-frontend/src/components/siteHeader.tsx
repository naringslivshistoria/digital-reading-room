import { Grid } from "@mui/material"
import { useLocation } from "react-router-dom"

import header from '../../assets/header.jpg'
import { Search } from "../routes/search"

export const SiteHeader = () => {
  const location = useLocation()

  return (
  <Grid container direction='row' sx={{ height: { xs: '240px', sm: '285px' }, bgcolor: 'primary.main' }}>
      <Grid item md={1} xs={1} />
      <Grid item md={6} xs={11}>
        <Search searchEnabled={ location.pathname !== '/login' } />
      </Grid>
      <Grid item md={5} xs={0} style={{ backgroundColor: 'red', backgroundImage: `url(${header})`, backgroundSize: 'cover' }} sx={{ height: '100%' }} >
      </Grid>
  </Grid>
  )
}