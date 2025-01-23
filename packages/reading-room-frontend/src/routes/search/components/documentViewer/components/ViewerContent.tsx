import { useState, useEffect } from 'react'
import { CircularProgress, Box, Typography } from '@mui/material'
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

  useEffect(() => {
    setShowThumbnail(true)
    setIsLoading(true)
  }, [file])

  const handleDocumentLoad = () => {
    setIsLoading(false)
    setTimeout(() => {
      setShowThumbnail(false)
    }, 300)
  }

  if (file.url.endsWith('.tif')) {
    setIsLoading(false)
    return (
      <Typography variant="h6" sx={{ color: 'white' }}>
        Denna filtyp stöds inte för visning i webbläsaren. Ladda ner filen för
        att se den.
      </Typography>
    )
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
            opacity: !isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
          onError={(e) => {
            setIsLoading(false)
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      {type === ViewerType.PDF ? (
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
            onLoadError={(error) => console.error('PDF-laddningsfel:', error)}
            onSourceError={(error) => console.error('PDF-källfel:', error)}
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
      ) : type === ViewerType.VIDEO ? (
        <VideoPlayer file={file} key={file.url} />
      ) : (
        <img
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
          onError={() => setIsLoading(false)}
          key={file.url}
        />
      )}
    </Box>
  )
}
