import { Grid, List, ListItem, Typography } from '@mui/material'
import { SiteHeader } from '../../components/siteHeader'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'
import { useFieldValues } from '../search/hooks/useSearch'

export const MyPage = () => {
  const { data: user } = useIsLoggedIn(true)
  const { data: fieldValues } = useFieldValues({ filter: null })

  const getFieldValues = (fieldName: string) =>
    fieldValues?.find((c) => c.fieldName === fieldName)?.allValues || []

  const currentValues = {
    depositor: getFieldValues('depositor'),
    archiveInitiator: getFieldValues('archiveInitiator'),
    seriesName: getFieldValues('seriesName'),
    volume: getFieldValues('volume'),
  }

  const validateHierarchy = (path: string, levels: string[][]) => {
    const parts = path.split('>')
    return parts.every((part, index) => levels[index]?.includes(part) ?? false)
  }

  const accessList = [
    ...(user?.depositors?.filter((d) => currentValues.depositor.includes(d)) ||
      []),
    ...(user?.archiveInitiators?.filter((a) =>
      validateHierarchy(a, [
        currentValues.depositor,
        currentValues.archiveInitiator,
      ])
    ) || []),
    ...(user?.series?.filter((s) =>
      validateHierarchy(s, [
        currentValues.depositor,
        currentValues.archiveInitiator,
        currentValues.seriesName,
      ])
    ) || []),
    ...(user?.volumes?.filter((v) =>
      validateHierarchy(v, [
        currentValues.depositor,
        currentValues.archiveInitiator,
        currentValues.seriesName,
        currentValues.volume,
      ])
    ) || []),
    ...(user?.documentIds?.filter((id) => id) || []),
  ]
    .filter(Boolean)
    .sort()

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
            Min sida
          </Typography>
          <Typography variant="body1">
            <b>Användarnamn: </b>
            {user?.username}
          </Typography>
          <Typography variant="body1">
            <b>Namn: </b>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body1">
            <b>Organisation: </b>
            {user?.organization}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: 14, sm: 16 },
              marginTop: { xs: '0px', sm: '10px' },
            }}
          >
            <b>Du kan söka i följande arkiv och dokument: </b>
          </Typography>
          <List
            sx={{ listStyleType: 'disc', paddingTop: 0, marginLeft: '20px' }}
          >
            {accessList.map((archive) => (
              <ListItem sx={{ display: 'list-item' }} key={archive}>
                {archive}
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={0.5} sm={1} />
      </Grid>
    </>
  )
}
