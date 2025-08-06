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
  attachmentType: string
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
  thumbnailUrl?: string
}

interface ViewerContentProps {
  file: any
  type: ViewerType
  currentPdfPage: number
  onPdfLoad: (pdf: any) => void
  thumbnailUrl?: string
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  scale?: number
  rotation?: number
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
  scale?: number
  rotation?: number
}

interface ThumbnailImageProps {
  thumbnailUrl: string | null
  pageType: string
  showIcon?: boolean
  style?: React.CSSProperties
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
  ThumbnailImageProps,
}

export { ViewerType }
