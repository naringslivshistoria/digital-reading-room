import { Typography } from '@mui/material'
import { Link, useSearchParams } from 'react-router-dom'

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
  const [searchParams] = useSearchParams()

  const getFieldValueString = (fieldName: string) => {
    if (!document.fields[fieldName]?.value) {
      return '-'
    }

    if (fieldName === 'volume') {
      const existingFilter = searchParams.get('filter') || ''
      const newFilter = existingFilter
        .split('||')
        .filter((f) => !f.startsWith('volume::'))
        .concat(`volume::${document.fields.volume.value}`)
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
