import { CircularProgress } from '@mui/material'
import { Document as PdfDocument, Page as PdfPage } from 'react-pdf'
import { ViewerContentProps, ViewerType } from '../../../../../common/types'

export const ViewerContent = ({
  type,
  file,
  currentPdfPage,
  isImageLoading,
  onPdfLoad,
  onImageLoad,
  onImageError,
}: ViewerContentProps) => {
  if (type === ViewerType.PDF) {
    return (
      <PdfDocument
        file={file}
        onLoadError={(error) => console.error('PDF-laddningsfel:', error)}
        onSourceError={(error) => console.error('PDF-källfel:', error)}
        onLoadSuccess={onPdfLoad}
        loading={<CircularProgress />}
        error={<p>Kunde inte ladda PDF...</p>}
      >
        <PdfPage
          pageNumber={currentPdfPage}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          loading={<CircularProgress />}
          canvasBackground="black"
        />
      </PdfDocument>
    )
  }

  return (
    <img
      src={file.url}
      alt="Dokument"
      style={{
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain',
        display: isImageLoading ? 'none' : 'block',
      }}
      onLoad={onImageLoad}
      onError={onImageError}
    />
  )
}
