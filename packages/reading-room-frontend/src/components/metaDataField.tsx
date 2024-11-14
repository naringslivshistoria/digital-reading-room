import { Typography } from '@mui/material'

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
    if (
      !document.fields[fieldName] ||
      !document.fields[fieldName].value ||
      document.fields[fieldName].value === ''
    ) {
      return '-'
    } else {
      return document.fields[fieldName].value
    }
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
