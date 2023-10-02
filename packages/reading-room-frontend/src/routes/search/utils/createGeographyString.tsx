import { ReactElement } from 'react'

import { Document } from '../../../common/types'

export const createGeographyField = (document: Document): ReactElement => {
  return <>{createGeographyString(document)}</>
}

export const createMediaTypeField = (document: Document): ReactElement => {
  return (
    <>
      {document.pages[0].pageType}
      {document.fields.format?.value &&
        ' (' + document.fields.format?.value + ')'}
      <br />
      {document.fields.filename?.value}
    </>
  )
}

export const createGeographyString = (document: Document) => {
  if (document.fields.location?.value) {
    let location = document.fields.location?.value
    if (location.endsWith(',')) location = location.slice(0, -1)
    return location
  } else {
    const geographyParts: string[] = []

    const fieldNames: string[] = [
      'street',
      'streetNumber',
      'block',
      'street2',
      'streetNumber2',
      'block2',
      'parish',
      'city',
      'areaMinor',
      'areaMajor',
      'region',
      'country',
    ]

    fieldNames.forEach((fieldName: string) => {
      if (document.fields[fieldName] && document.fields[fieldName].value) {
        geographyParts.push(document.fields[fieldName].value)
      }
    })

    return geographyParts.join(', ')
  }
}

export const createMediaTypeString = (document: Document) => {
  let mediaTypeString = document.pages[0].pageType

  if (document.fields.format?.value) {
    mediaTypeString += ' (' + document.fields.format?.value + ')'
  }

  mediaTypeString += ' ' + document.fields.filename?.value

  return mediaTypeString
}
