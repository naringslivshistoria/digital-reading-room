import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import { Document as PdfDocument, Page as PdfPage } from 'react-pdf'
import { ViewerContentProps, ViewerType } from '../../../../../common/types'
import { VideoPlayer } from './VideoPlayer'
import noImage from '../../../../../../assets/no-image.png'

export const ViewerContent = ({
  type,
  file,
  currentPdfPage,
  onPdfLoad,
  thumbnailUrl,
  isLoading,
  setIsLoading,
}: ViewerContentProps) => {
  const [showThumbnail, setShowThumbnail] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setShowThumbnail(true)
    setIsLoading(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (
      type !== ViewerType.PDF &&
      type !== ViewerType.VIDEO &&
      imgRef.current?.complete
    ) {
      handleDocumentLoad()
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [file, setIsLoading])

  const handleDocumentLoad = useCallback(() => {
    setIsLoading(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setShowThumbnail(false)
    }, 300)
  }, [setIsLoading])

  if (file.url.endsWith('.tif')) {
    setIsLoading(false)
    return (
      <Typography variant="h6" sx={{ color: 'white' }}>
        Denna filtyp stöds inte för visning i webbläsaren. Ladda ner filen för
        att se den.
      </Typography>
    )
  }

  const renderContent = () => {
    if (type === ViewerType.PDF) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <PdfDocument
            file={file}
            onLoadError={(error) => {
              console.error('PDF-laddningsfel:', error)
              setIsLoading(false)
            }}
            onSourceError={(error) => {
              console.error('PDF-källfel:', error)
              setIsLoading(false)
            }}
            onLoadSuccess={(pdf) => {
              setIsLoading(false)
              onPdfLoad?.(pdf)
            }}
            loading={null}
            error={<p>Kunde inte ladda PDF...</p>}
            key={file.url}
          >
            <PdfPage
              pageNumber={currentPdfPage}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={null}
              canvasBackground="black"
            />
          </PdfDocument>
        </Box>
      )
    } else if (type === ViewerType.VIDEO) {
      return <VideoPlayer file={file} key={file.url} />
    } else {
      return (
        <img
          ref={imgRef}
          src={file.url}
          alt="Dokument"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            position: 'absolute',
            top: 0,
          }}
          onLoad={handleDocumentLoad}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = noImage
            setIsLoading(false)
          }}
          key={file.url}
        />
      )
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {showThumbnail && thumbnailUrl && (
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
            opacity: isLoading ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = noImage
            setIsLoading(false)
            setShowThumbnail(false)
          }}
        />
      )}
      {renderContent()}
    </Box>
  )
}
