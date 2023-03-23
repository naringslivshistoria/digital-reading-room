import { Grid } from "@mui/material"
import { Search } from "../routes/search"
import header from '../../assets/header.jpg'

export const SearchHeader = () => {
    return (
        <>
        <Grid container direction='row' alignItems='center' alignContent="center" sx={{ height: '250px', bgcolor: 'primary.main' }}>
            <Grid item sm={8} xs={12} alignItems='center' alignContent="center">
            <Grid container justifyContent='center'>
                <Grid item sm={8} xs={12} sx={{ padding: '0 10px 0 10px' }}>
                    <Search />
                </Grid>
            </Grid>
            </Grid>
            <Grid item sm={4} xs={0} style={{ backgroundColor: 'red', backgroundImage: `url(${header})`, backgroundSize: 'cover' }} sx={{ height: '100%' }} >
        </Grid>
    </Grid>
    </>
    )
}