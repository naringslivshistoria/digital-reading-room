import { Typography } from '@mui/material'
import { Link } from 'react-router-dom'

import { Document } from '../common/types'

export const MetaDataField = ({
  document,
  fieldName,
  heading,
}: {
  document: Document
  fieldName?: string
  heading: string
}) => {
  const getFieldValueString = (fieldName: string) => {
    if (!document.fields[fieldName]?.value) {
      return '-'
    }
    if (fieldName === 'volume') {
      const newFilter = [
        `depositor::${document.fields.depositor.value}`,
        `archiveInitiator::${document.fields.archiveInitiator.value}`,
        `seriesName::${document.fields.seriesSignature.value} - ${document.fields.seriesName.value}`,
        `volume::${document.fields.volume.value}`,
      ]
        .filter((f) => f)
        .join('||')

      const searchString = `/search?query=${
        newFilter ? `&filter=${encodeURIComponent(newFilter)}` : ''
      }`

      return <Link to={searchString}>{document.fields[fieldName].value}</Link>
    }

    return document.fields[fieldName].value
  }

  return (
    <>
      {document.fields[fieldName ?? '']?.value ? (
        <>
          <Typography variant="h4">{heading}</Typography>
          {getFieldValueString(fieldName ?? '')}
        </>
      ) : (
        <>
          <Typography variant="h4">{heading}</Typography>
          <Typography variant="body1">-</Typography>
        </>
      )}
    </>
  )
}
