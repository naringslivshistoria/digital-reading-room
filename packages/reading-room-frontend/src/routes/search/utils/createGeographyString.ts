import { Document } from '../../../common/types'

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
  return (
    document.pages[0].pageType +
    ' (' +
    document.fields.format?.value +
    ') ' +
    document.fields.filename?.value
  )
}
