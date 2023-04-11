import { Grid, Typography } from '@mui/material'

import { SearchHeader } from '../../components/searchHeader'

export const PageAbout = () => {
  return (
    <>
    <SearchHeader></SearchHeader>
    <Grid container>
        <Grid item sm={1} />
        <Grid item sm={10} sx={{ paddingTop: 10  }} >
          <Typography variant='body2'>
            I vår digitala läsesal kommer du enkelt åt alla arkiv som är öppna för dig.
          </Typography>
          <Typography variant='body2'>
            Lorem ipsum dolor sit amet.
          </Typography>
        </Grid>
        <Grid item sm={1} />
    </Grid>
    </>
  )
}
