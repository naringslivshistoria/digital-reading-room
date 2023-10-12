import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom'
import DownloadIcon from '@mui/icons-material/Download'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { useEffect, useState } from 'react'

import { SiteHeader } from '../../components/siteHeader'
import { useGetDocument } from './hooks/useGetDocument'
import { Document } from '../../common/types'
import noImage from '../../../assets/no-image.png'
import { MetaDataField } from '../../components/metaDataField'
import termsPdf from '../../../assets/cfn-nedladdning-villkor.pdf'
import {
  MetaDataFieldConfiguration,
  MetaDataFieldType,
  metaDataFieldConfigurations,
} from './metaDataFieldConfigs'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export const DocumentPage = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data } = useGetDocument({ id: id ?? '' })
  const navigate = useNavigate()
  const [showDownload, setShowDownload] = useState<boolean>(false)

  useIsLoggedIn()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const document = data?.results as Document

  const goBack = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    if (searchParams.get('query')) {
      navigate(-1)
    } else {
      navigate('/search')
    }
  }

  const hasFields = (...args: string[]): boolean => {
    return (
      args.find((fieldName: string) => {
        return document.fields[fieldName]?.value
      }) != undefined
    )
  }

  const getMetaDataFieldConfiguration = (document: Document) => {
    return (
      metaDataFieldConfigurations[document.fields['archiveInitiator']?.value] ??
      metaDataFieldConfigurations['default']
    )
  }

  return (
    <>
      <SiteHeader />
      <Grid container bgcolor="white">
        <Grid item xs={1} />
        <Grid item xs={10} sx={{ marginBottom: 10 }}>
          {document ? (
            <>
              <Box sx={{ marginTop: 3, marginBottom: 2 }}>
                <Link to="" onClick={goBack}>
                  <ChevronLeftIcon sx={{ marginTop: '-2px' }} /> Sökträffar
                </Link>
              </Box>
              <Divider sx={{ borderColor: 'red' }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
                sx={{ padding: '20px 0 20px 0' }}
              >
                <Box>
                  <Typography variant="h3">
                    {document.fields.title?.value}
                  </Typography>
                  (från arkivet {document.fields.archiveInitiator?.value})
                </Box>
                <Button
                  variant="text"
                  disableElevation
                  sx={{
                    color: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.main',
                      color: 'white',
                    },
                  }}
                  onClick={() => {
                    setShowDownload(true)
                  }}
                >
                  Ladda ner <DownloadIcon />
                </Button>
                <Dialog open={showDownload}>
                  <DialogTitle>
                    <Typography variant="h2">Ladda ner media</Typography>
                  </DialogTitle>
                  <DialogContent>
                    Att du kan ladda ner filen betyder inte att du har rätt att
                    använda den fritt.{' '}
                    <b>
                      <a href={termsPdf} target="_blank" rel="noreferrer">
                        Läs mer här om vilka villkor som gäller
                      </a>
                    </b>
                    . Genom att ladda ned accepterar du de villkoren.
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => {
                        setShowDownload(false)
                      }}
                      sx={{ marginRight: 2 }}
                    >
                      Stäng
                    </Button>
                    <a
                      href={`${searchUrl}/document/${document.id}/attachment/${
                        document.fields.filename?.value ?? 'bilaga'
                      }`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        onClick={() => {
                          setShowDownload(false)
                        }}
                      >
                        Ladda ner
                      </Button>
                    </a>
                  </DialogActions>
                </Dialog>
              </Stack>
              <Box sx={{ marginTop: 1, marginBottom: 5 }}>
                <Button
                  onClick={() => {
                    setShowDownload(true)
                  }}
                >
                  <img
                    src={
                      document.pages[0].thumbnailUrl
                        ? searchUrl + '/document/' + document.id + '/thumbnail'
                        : noImage
                    }
                    alt="Liten bild för dokumentet"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null // prevents looping
                      currentTarget.src = noImage
                    }}
                  />
                </Button>
              </Box>
              <Stack direction="column" width="100%" rowGap={2}>
                <Grid
                  container
                  rowSpacing={{ xs: 1, sm: 2 }}
                  columnSpacing={{ xs: 1, sm: 2 }}
                >
                  {getMetaDataFieldConfiguration(document).map(
                    (fieldConfig: MetaDataFieldConfiguration) => {
                      let showItem: boolean =
                        fieldConfig.hasFields === undefined ||
                        hasFields(...fieldConfig.hasFields)

                      if (fieldConfig.type === MetaDataFieldType.TextField) {
                        showItem =
                          showItem &&
                          Boolean(
                            document.fields[fieldConfig.fieldName ?? '']?.value
                          )
                      }

                      if (showItem) {
                        return (
                          <Grid
                            item
                            xs={fieldConfig.xs}
                            sm={fieldConfig.sm}
                            key={fieldConfig.heading}
                          >
                            {fieldConfig.type ===
                              MetaDataFieldType.TextField && (
                              <MetaDataField
                                document={document}
                                heading={fieldConfig.heading ?? ''}
                                fieldName={fieldConfig.fieldName ?? ''}
                              />
                            )}
                            {fieldConfig.type ===
                              MetaDataFieldType.Subheading && (
                              <Typography
                                variant="h3"
                                sx={{ paddingTop: 4, paddingBottom: 2 }}
                              >
                                {fieldConfig.heading}
                              </Typography>
                            )}
                            {fieldConfig.type ===
                              MetaDataFieldType.Function && (
                              <>
                                {' '}
                                <Typography variant="h4">
                                  {fieldConfig.heading}
                                </Typography>
                                {fieldConfig.formattingFunction &&
                                  fieldConfig.formattingFunction(document)}
                              </>
                            )}
                            {fieldConfig.type ===
                              MetaDataFieldType.VisibleDivider && <Divider />}
                          </Grid>
                        )
                      }
                    }
                  )}
                </Grid>
              </Stack>
            </>
          ) : (
            <div style={{ padding: '30px' }}>Felaktigt dokumentid</div>
          )}
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </>
  )
}
