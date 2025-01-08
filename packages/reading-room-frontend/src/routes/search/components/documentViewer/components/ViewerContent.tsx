import { useState, useEffect } from 'react'
import { CircularProgress, Box } from '@mui/material'
import { Document as PdfDocument, Page as PdfPage } from 'react-pdf'

import { ViewerContentProps, ViewerType } from '../../../../../common/types'
import { VideoPlayer } from './VideoPlayer'
import noImage from '../../../../../../assets/no-image.png'

export const ViewerContent = ({
  type,
  file,
  currentPdfPage,
  onPdfLoad,
  onImageLoad,
  onImageError,
  thumbnailUrl,
}: ViewerContentProps) => {
  const [showThumbnail, setShowThumbnail] = useState(true)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    setShowThumbnail(true)
    setThumbnailError(false)
    setImageLoaded(false)
  }, [file])

  const handleImageLoad = () => {
    setImageLoaded(true)
    setTimeout(() => {
      setShowThumbnail(false)
    }, 300)
    onImageLoad?.()
  }

  const handleThumbnailError = ({
    currentTarget,
  }: {
    currentTarget: HTMLImageElement
  }) => {
    currentTarget.onerror = null
    currentTarget.src = noImage
    setThumbnailError(true)
  }

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

  if (type === ViewerType.VIDEO) {
    return <VideoPlayer file={file} />
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {showThumbnail && thumbnailUrl && !thumbnailError && (
        <img
          src={thumbnailUrl}
          alt="Dokument (thumbnail)"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: imageLoaded ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
          onError={handleThumbnailError}
        />
      )}
      <img
        src={typeof file === 'string' ? file : file.url}
        alt="Dokument"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: imageLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
        onLoad={handleImageLoad}
        onError={onImageError}
      />
    </Box>
  )
}
