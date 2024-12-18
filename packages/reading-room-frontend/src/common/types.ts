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

interface Position {
  x: number
  y: number
}

interface DocumentViewerProps {
  file: string
  isPdf: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
}

interface NavigationButtonsProps {
  isPdf: boolean
  currentPdfPage: number
  numPages: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export type {
  Document,
  Dictionary,
  Field,
  Fields,
  Position,
  DocumentViewerProps,
  NavigationButtonsProps,
  CreateAccountFormData,
  CreateAccountFormErrors,
}
