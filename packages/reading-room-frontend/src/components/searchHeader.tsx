import { Grid } from "@mui/material"

import header from '../../assets/header.jpg'
import { Search } from "../routes/search"

export const SearchHeader = () => {
    return (
    <Grid container direction='row' alignItems='center' alignContent="center" sx={{ height: '285px', bgcolor: 'primary.main' }}>
        <Grid item sm={1} />
        <Grid item sm={6} xs={12} alignItems='center' alignContent="center">
            <Search />
        </Grid>
        <Grid item sm={5} xs={0} style={{ backgroundColor: 'red', backgroundImage: `url(${header})`, backgroundSize: 'cover' }} sx={{ height: '100%' }} >
        </Grid>
    </Grid>
    )
}