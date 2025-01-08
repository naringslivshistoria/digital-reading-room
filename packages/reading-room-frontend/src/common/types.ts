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

enum ViewerType {
  VIDEO = 'video',
  IMAGE = 'image',
  PDF = 'pdf',
}

interface DocumentViewerProps {
  file: string
  type: ViewerType
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  name: string
  download: () => void
}

interface ViewerContentProps {
  file: any
  type: ViewerType
  currentPdfPage: number
  isImageLoading: boolean
  onPdfLoad: (pdf: any) => void
  onImageLoad: () => void
  onImageError: () => void
}

interface NavigationButtonsProps {
  type: ViewerType
  currentPdfPage: number
  numPages: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}

interface ZoomControlsProps {
  scale: number
  position: { x: number; y: number }
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onRotate: () => void
}

interface VideoPlayerProps {
  file: {
    url: string
  }
}

export type {
  Document,
  Dictionary,
  Field,
  Fields,
  Position,
  DocumentViewerProps,
  ViewerContentProps,
  NavigationButtonsProps,
  CreateAccountFormData,
  CreateAccountFormErrors,
  ZoomControlsProps,
  VideoPlayerProps,
}

export { ViewerType }
