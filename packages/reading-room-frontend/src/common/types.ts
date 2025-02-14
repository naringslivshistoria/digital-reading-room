interface Field {
  id: number
  originalName: string
  value: string
}

interface Fields {
  [key: string]: Field
}

interface Page {
  pageType: string
  url: string
  thumbnailUrl: string
}

interface Document {
  id: number
  documentState: string
  fields: Fields
  pages: [Page]
}

interface Dictionary<Type> {
  [key: string]: Type
}

interface CreateAccountFormData {
  username: string
  secondUsername: string
  firstName: string
  lastName: string
  organization: string
  password: string
  retypePassword: string
}

interface CreateAccountFormErrors {
  username: string
  secondUsername: string
  firstName: string
  lastName: string
  password: string
  retypePassword: string
}

interface ThumbnailImageProps {
  document: Document
  searchUrl: string
}

export type {
  Document,
  Dictionary,
  Field,
  Fields,
  CreateAccountFormData,
  CreateAccountFormErrors,
  ThumbnailImageProps,
}
