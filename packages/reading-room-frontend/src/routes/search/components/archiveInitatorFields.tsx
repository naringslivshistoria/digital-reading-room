import { Grid } from '@mui/material'
import Typography from '@mui/material/Typography'

import { createGeographyString } from '..'
import { MetaDataField } from '../../../components/metaDataField'
import { Document } from '../../../common/types'

export default function ArchiveInitiatorFields({
  document,
}: {
  document: Document
}) {
  const fields = []
  console.log(document.fields)
  switch (document.fields?.archiveInitiator?.value) {
    case 'Hantverkslotteriet':
      fields.push({
        heading: 'ARKITEKT',
        fieldName: 'architect',
      })
      fields.push({
        heading: 'DOKUMENTTYP',
        fieldName: 'documentType',
      })
      fields.push({
        heading: 'ÅR',
        fieldName: 'year',
      })
      break
    case 'Brandförsäkringsverket':
      fields.push({
        heading: 'FÖRSÄKRINGSNUMMER',
        fieldName: 'insuranceNumber',
      })
      fields.push({
        heading: 'ÅR',
        fieldName: 'year',
      })
      fields.push({
        heading: 'VERKSAMHET',
        fieldName: 'business',
      })
      fields.push({
        heading: 'ÄGARE',
        fieldName: 'owner',
      })
      fields.push({
        heading: 'ORT',
        fieldName: 'city',
      })
      fields.push({
        heading: 'SOCKEN/FÖRSAMLING',
        fieldName: 'parish',
      })
      fields.push({
        heading: 'LÄN',
        fieldName: 'region',
      })
      break
    default:
      fields.push({
        heading: 'BESKRIVNING',
        fieldName: 'description',
      })
      fields.push({
        heading: 'ÅRTAL',
        fieldName: 'time',
      })
      fields.push({
        heading: 'GEOGRAFI',
        fieldName: 'geography',
      })
      fields.push({
        heading: 'MOTIVID',
        fieldName: 'motiveId',
      })
      fields.push({
        heading: 'MEDIETYP',
        fieldName: 'format',
      })
  }

  return (
    <Grid
      container
      rowSpacing={{ xs: 1, sm: 2 }}
      columnSpacing={{ xs: 1, sm: 2 }}
    >
      {fields.map((field, index) => (
        <Grid
          item
          key={index}
          xs={12}
          sm={field.fieldName === 'description' ? 8 : 4}
          sx={{
            display: {
              xs:
                field.fieldName === 'description' ||
                field.fieldName === 'geography'
                  ? 'none'
                  : 'block',
              sm: 'block',
            },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {field.fieldName === 'geography' ? (
            <>
              <Typography variant="h4">{field.heading}</Typography>
              {createGeographyString(document) || '-'}
            </>
          ) : field.fieldName === 'format' ? (
            <>
              <Typography variant="h4">{field.heading}</Typography>
              {document.pages[0].pageType} ({document.fields.format?.value})
              <br />
              {document.fields.filename?.value}
            </>
          ) : (
            <MetaDataField
              document={document}
              heading={field.heading}
              fieldName={field.fieldName}
            />
          )}
        </Grid>
      ))}
    </Grid>
  )
}
