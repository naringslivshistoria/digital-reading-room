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
import { useAuth } from '../../hooks/useAuth'
import { Document } from '../../common/types'
import { createGeographyString, createMediaTypeString } from '../search'
import noImage from '../../../assets/no-image.png'
import { MetaDataField } from '../../components/metaDataField'
import termsPdf from '../../../assets/cfn-nedladdning-villkor.pdf'

const searchUrl = import.meta.env.VITE_SEARCH_URL || 'http://localhost:4001'

enum MetaDataFieldType {
  TextField,
  Function,
  VisibleDivider,
  InvisibleDivider,
  Subheading,
}

interface MetaDataFieldConfiguration {
  fieldName: string
  heading?: string
  formattingFunction?: (document: Document) => string
  type: MetaDataFieldType
  xs: number
  sm: number
}

interface Dictionary<Type> {
  [key: string]: Type
}

const MetaDataConfigurations: Dictionary<MetaDataFieldConfiguration[]> = {
  Brandförsäkringsverket: [],
  default: [
    {
      fieldName: 'description',
      heading: 'BESKRIVNING',
      type: MetaDataFieldType.TextField,
      xs: 8,
      sm: 8,
    },
    {
      fieldName: 'divider1',
      type: MetaDataFieldType.InvisibleDivider,
      xs: 12,
      sm: 12,
    },
    {
      fieldName: 'time',
      heading: 'ÅRTAL',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'geography',
      heading: 'GEOGRAFI',
      type: MetaDataFieldType.Function,
      xs: 6,
      sm: 4,
      formattingFunction: createGeographyString,
    },
    {
      fieldName: 'mediaType',
      heading: 'MEDIETYP',
      type: MetaDataFieldType.Function,
      xs: 6,
      sm: 4,
      formattingFunction: createMediaTypeString,
    },
    {
      fieldName: 'motiveId',
      heading: 'MOTIVID',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'tags',
      heading: 'TAGGAR',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'originalText',
      heading: 'ORGINALTEXT',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'englishTitle',
      heading: 'ENGLISH TITLE',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'englishDescription',
      heading: 'ENGLISH DESCRIPTION',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
    {
      fieldName: 'otherInfo',
      heading: 'Övrig information',
      type: MetaDataFieldType.Subheading,
      xs: 12,
      sm: 12,
    },
    {
      fieldName: 'seriesSignature',
      heading: 'SERIESIGNUM',
      type: MetaDataFieldType.TextField,
      xs: 6,
      sm: 4,
    },
  ],
}

export const DocumentPage = () => {
  const { token } = useAuth()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data } = useGetDocument({ id: id ?? '', token })
  const navigate = useNavigate()
  const [showDownload, setShowDownload] = useState<boolean>(false)

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

  const hasFields = (...args: string[]) => {
    return args.find((fieldName: string) => {
      return document.fields[fieldName]?.value
    })
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
                  {MetaDataConfigurations['default'].map(
                    (fieldConfig: MetaDataFieldConfiguration) => (
                      <Grid
                        item
                        xs={fieldConfig.xs}
                        sm={fieldConfig.sm}
                        key={fieldConfig.heading}
                      >
                        {fieldConfig.type === MetaDataFieldType.TextField && (
                          <MetaDataField
                            document={document}
                            heading={fieldConfig.heading ?? ''}
                            fieldName={fieldConfig.fieldName ?? ''}
                          />
                        )}
                        {fieldConfig.type === MetaDataFieldType.Subheading && (
                          <Typography
                            variant="h3"
                            sx={{ paddingTop: 4, paddingBottom: 2 }}
                          >
                            {fieldConfig.heading}
                          </Typography>
                        )}
                        {fieldConfig.type === MetaDataFieldType.Function && (
                          <>
                            {' '}
                            <Typography variant="h4">
                              {fieldConfig.heading}
                            </Typography>
                            {fieldConfig.formattingFunction &&
                              fieldConfig.formattingFunction(document)}
                          </>
                        )}
                      </Grid>
                    )
                  )}
                </Grid>
              </Stack>
              <Divider />
              <Stack direction="column" width="100%" rowGap={2}>
                <Grid
                  container
                  rowSpacing={{ xs: 1, sm: 2 }}
                  columnSpacing={{ xs: 1, sm: 2 }}
                >
                  <Grid item sm={8}>
                    <MetaDataField
                      document={document}
                      heading="BESKRIVNING"
                      fieldName={'description'}
                    />
                  </Grid>
                  <Grid item xs={12} />
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="ÅRTAL"
                      fieldName={'time'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="h4">GEOGRAFI</Typography>
                    {createGeographyString(document)}
                  </Grid>
                  <Grid item xs={6} sm={4} sx={{ overflow: 'hidden' }}>
                    <Typography variant="h4">MEDIETYP</Typography>
                    {document.pages[0].pageType} (
                    {document.fields.format?.value})<br />
                    {document.fields.filename?.value}
                  </Grid>
                  <Grid item xs={6} sm={4} sx={{ overflow: 'hidden' }}>
                    <MetaDataField
                      document={document}
                      heading="MOTIVID"
                      fieldName={'motiveId'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="TAGGAR"
                      fieldName={'tags'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="ORIGINALTEXT"
                      fieldName={'originalText'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="ENGLISH TITLE"
                      fieldName={'englishTitle'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="ENGLISH DESCRIPTION"
                      fieldName={'englishDescription'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant="h3"
                      sx={{ paddingTop: 4, paddingBottom: 2 }}
                    >
                      Övrig information
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="DEPONENT"
                      fieldName={'depositor'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="SERIESIGNUM"
                      fieldName={'seriesSignature'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="SERIE"
                      fieldName={'seriesName'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="FÖRVARING/ORDNING"
                      fieldName={'storage'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="MEDIEBÄRARE"
                      fieldName={'mediaCarrier'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="VOLYM"
                      fieldName={'volume'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="ALBUM"
                      fieldName={'album'}
                    />
                  </Grid>
                  {hasFields('creator', 'company') && (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  )}
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="KREATÖR"
                      fieldName={'creator'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="KREATÖR FIRMA"
                      fieldName={'company'}
                    />
                  </Grid>
                  {hasFields(
                    'block',
                    'property',
                    'parish',
                    'areaMinor',
                    'areaMajor',
                    'municipality',
                    'region',
                    'street2',
                    'streetNumber2',
                    'property2',
                    'block2'
                  ) && (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  )}
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="KVARTER"
                      fieldName={'block'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="FASTIGHET"
                      fieldName={'property'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="FÖRSAMLING"
                      fieldName={'parish'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="OMRÅDE MINDRE"
                      fieldName={'areaMinor'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="OMRÅDE STÖRRE"
                      fieldName={'areaMajor'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="KOMMUN"
                      fieldName={'municipality'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="LÄN"
                      fieldName={'region'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="GATA 2"
                      fieldName={'street2'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="GATUNUMMER 2"
                      fieldName={'streetNumber2'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="FASTIGHET 2"
                      fieldName={'property2'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="KVARTER 2"
                      fieldName={'block2'}
                    />
                  </Grid>
                  {hasFields('published', 'rights', 'language') && (
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                  )}
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="SPRÅK"
                      fieldName={'language'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="PUBLICERAD"
                      fieldName={'published'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <MetaDataField
                      document={document}
                      heading="RÄTTIGHETER"
                      fieldName={'rights'}
                    />
                  </Grid>
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
