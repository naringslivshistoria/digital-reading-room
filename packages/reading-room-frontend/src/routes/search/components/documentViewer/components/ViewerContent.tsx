import { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import { Document as PdfDocument, Page as PdfPage } from 'react-pdf'

import { ViewerContentProps, ViewerType } from '../../../../../common/types'
import { VideoPlayer } from './VideoPlayer'
import noImage from '../../../../../../assets/no-image.png'
import { ThumbnailImage } from '../../thumbnailImage'

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
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleDocumentLoad = useCallback(() => {
    if (!mountedRef.current) return

    setIsLoading(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setShowThumbnail(false)
      }
    }, 300)
  }, [setIsLoading])

  const isTif = file.url.endsWith('.tif')

  useEffect(() => {
    if (isTif || type === ViewerType.VIDEO) {
      setShowThumbnail(false)
      setIsLoading(false)
      return
    }
    setShowThumbnail(true)
    setIsLoading(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (type !== ViewerType.PDF && imgRef.current?.complete) {
      handleDocumentLoad()
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [file, setIsLoading, handleDocumentLoad, type, isTif])

  if (isTif) {
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
            onLoadError={() => {
              if (mountedRef.current) {
                setIsLoading(false)
              }
            }}
            onSourceError={() => {
              if (mountedRef.current) {
                setIsLoading(false)
              }
            }}
            onLoadSuccess={(pdf) => {
              if (mountedRef.current) {
                setIsLoading(false)
                onPdfLoad?.(pdf)
              }
            }}
            loading={null}
            error={
              <Typography variant="h6" sx={{ color: 'white' }}>
                Kunde inte ladda PDF.
              </Typography>
            }
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
            if (mountedRef.current) {
              setIsLoading(false)
            }
          }}
          key={file.url}
        />
      )
    }
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {showThumbnail && thumbnailUrl && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: isLoading ? 2 : 0,
            opacity: isLoading ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out, z-index 0s 0.3s',
          }}
        >
          <ThumbnailImage
            thumbnailUrl={thumbnailUrl}
            pageType={type}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            showIcon={false}
          />
        </Box>
      )}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  )
}
