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
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useEffect, useState } from 'react'

import { SiteHeader } from '../../components/siteHeader'
import { Document } from '../../common/types'
import { MetaDataField } from '../../components/metaDataField'
import termsPdf from '../../../assets/cfn-nedladdning-villkor.pdf'
import {
  MetaDataFieldConfiguration,
  MetaDataFieldType,
  metaDataFieldConfigurations,
} from './metaDataFieldConfigs'
import { useIsLoggedIn } from '../../hooks/useIsLoggedIn'
import { useSearch } from '../search'
import { ThumbnailImage } from '../search/components/thumbnailImage'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

export const DocumentPage = () => {
  const { id } = useParams()
  const [document, setDocument] = useState<Document>()
  const [prevDocumentUrl, setPrevDocumentUrl] = useState<string | undefined>()
  const [nextDocumentUrl, setNextDocumentUrl] = useState<string | undefined>()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('query') ?? undefined
  const page = searchParams.get('page') ?? undefined
  const filter = searchParams.get('filter') ?? undefined
  const sort = searchParams.get('sort') ?? undefined
  const sortOrder = searchParams.get('sortOrder') ?? undefined
  const position = searchParams.get('position') ?? undefined

  const navigate = useNavigate()
  const [showDownload, setShowDownload] = useState<boolean>(false)

  useIsLoggedIn(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const pageSize = 20
  const { isLoading, data } = useSearch({
    query,
    startIndex: (+(page == undefined ? 2 : page) - 1) * pageSize,
    filter: filter == undefined ? '' : filter,
    sort,
    sortOrder,
  })

  useEffect(() => {
    let thisDoc = data?.results.find(
      (doc: Document) => doc.id.toString() == id
    ) as Document

    if (!document && position) {
      if (position) {
        const docByPosition = data?.results[+position - 1]

        if (docByPosition) thisDoc = docByPosition

        if (thisDoc) {
          searchParams.delete('position')
          navigate(`/dokument/${docByPosition?.id}?${searchParams.toString()}`)
        }
      }
    }

    setDocument(thisDoc)
  }, [id, data, position, searchParams, document, navigate])

  useEffect(() => {
    const getParamsForNavigationByPosition = (
      page: number,
      position: number
    ) => {
      let params = ''
      searchParams.forEach((value: string, key: string) => {
        if (key == 'page') params += `${key}=${page}&`
        else params += `${key}=${value}&`
      })
      params += `position=${position}`
      return params
    }

    const getUrlToPreviousDocument = () => {
      if (document) {
        const prevDocument = data?.results[data?.results.indexOf(document) - 1]
        if (prevDocument)
          return `/dokument/${prevDocument.id}?${searchParams.toString()}`
        else if (page && +page > 1)
          return `/dokument?${getParamsForNavigationByPosition(
            +page - 1,
            pageSize
          )}`
      }
      return ''
    }

    const getUrlToNextDocument = () => {
      if (document) {
        const nextDocument = data?.results[data?.results.indexOf(document) + 1]
        if (nextDocument)
          return `/dokument/${nextDocument.id}?${searchParams.toString()}`
        else if (data && page && +page * pageSize < data.hits)
          return `/dokument?${getParamsForNavigationByPosition(+page + 1, 1)}`
      }
      return ''
    }

    setPrevDocumentUrl(getUrlToPreviousDocument())
    setNextDocumentUrl(getUrlToNextDocument())
  }, [document, data, page, searchParams])

  const hasFields = (...args: string[]): boolean => {
    return (
      args.find((fieldName: string) => {
        return document?.fields[fieldName]?.value
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
              <Grid container display="flex">
                <Box
                  sx={{
                    marginTop: 3,
                    marginBottom: 2,
                    width: { sm: 140, xs: 20 },
                    marginRight: 'auto',
                  }}
                >
                  {prevDocumentUrl && (
                    <Link to={prevDocumentUrl}>
                      <ChevronLeftIcon sx={{ marginTop: '-2px' }} />{' '}
                      <Box sx={{ display: { sm: 'inline', xs: 'none' } }}>
                        Föregående
                      </Box>
                    </Link>
                  )}
                </Box>
                <Box
                  sx={{
                    marginTop: 3,
                    marginBottom: 2,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  <Link to={`/search?${searchParams.toString()}`}>
                    Alla sökträffar
                  </Link>
                </Box>
                <Box
                  sx={{
                    marginTop: 3,
                    marginBottom: 2,
                    width: { sm: 73, xs: 20 },
                    direction: 'row',
                    alignContent: 'end',
                    marginLeft: 'auto',
                    marginRight: 0,
                  }}
                >
                  {nextDocumentUrl && (
                    <Link to={nextDocumentUrl}>
                      <Box sx={{ display: { sm: 'inline', xs: 'none' } }}>
                        Nästa
                      </Box>
                      <ChevronRightIcon sx={{ marginTop: '-2px' }} />
                    </Link>
                  )}
                </Box>
              </Grid>
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
                  <ThumbnailImage document={document} searchUrl={searchUrl} />
                </Button>
              </Box>
              <Stack direction="column" width="100%" rowGap={2}>
                <Grid
                  container
                  rowSpacing={{ xs: 1, sm: 2 }}
                  columnSpacing={{ xs: 1, sm: 2 }}
                >
                  {getMetaDataFieldConfiguration(document).map(
                    (
                      fieldConfig: MetaDataFieldConfiguration,
                      index: number
                    ) => {
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
                            key={`${fieldConfig.heading}-${fieldConfig.fieldName}-${index}`}
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
            <div style={{ padding: '30px' }}>
              {!isLoading ? (
                <>Dokumentet kunde inte hämtas på grund av ett oväntat fel.</>
              ) : (
                <>Dokumentet hämtas...</>
              )}
            </div>
          )}
        </Grid>
        <Grid item xs={1} />
      </Grid>
    </>
  )
}
