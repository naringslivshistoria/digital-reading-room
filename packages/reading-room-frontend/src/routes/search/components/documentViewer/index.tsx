import { useState, useRef, useEffect, useMemo } from 'react'
import { Box, IconButton, Typography, CircularProgress } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { pdfjs } from 'react-pdf'

import { ZoomControls } from './components/ZoomControls'
import { NavigationButtons } from './components/NavigationButtons'
import { ViewerContent } from './components/ViewerContent'
import { DocumentViewerProps, ViewerType } from '../../../../common/types'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function DocumentViewer({
  file,
  type,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  name,
  download,
  thumbnailUrl,
}: DocumentViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [currentPdfPage, setCurrentPdfPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const pdfInstanceRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const fileConfig = useMemo(
    () => ({
      url: file,
      withCredentials: true,
    }),
    [file]
  )

  useEffect(() => {
    setCurrentPdfPage(1)
    setNumPages(0)
    if (pdfInstanceRef.current) {
      pdfInstanceRef.current.destroy().catch(console.error)
      pdfInstanceRef.current = null
    }
  }, [file, type])

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1)
      setScale(Math.min(Math.max(1, newScale), 5))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setStartDragPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - startDragPosition.x
      const newY = e.clientY - startDragPosition.y
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1))
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handlePrevious = () => {
    onPrevious?.()
  }

  const handleNext = () => {
    onNext?.()
  }

  const handlePreviousPDFPage = () => {
    if (currentPdfPage > 1) {
      setCurrentPdfPage((prev) => prev - 1)
    }
  }

  const handleNextPDFPage = () => {
    if (currentPdfPage < numPages) {
      setCurrentPdfPage((prev) => prev + 1)
    }
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const attachmentTypes = {
    [ViewerType.PDF]: 'Dokument',
    [ViewerType.VIDEO]: 'Film',
    [ViewerType.IMAGE]: 'Bild',
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000000',
        padding: '2rem',
        zIndex: 1300,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: { xs: '0 0 1rem 0', sm: '1rem 0' },
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'black',
              backgroundColor: 'white',
              padding: '0.1rem 0.5rem',
              borderRadius: '0.5rem',
            }}
          >
            {attachmentTypes[type]}
          </Typography>
          <Typography variant="h6" sx={{ color: 'white' }}>
            {name}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 0, sm: 5 },
            alignItems: 'center',
            marginLeft: { xs: '0', sm: 'auto' },
            marginTop: { xs: '1rem', sm: 0 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ZoomControls
              scale={scale}
              position={position}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
              onRotate={handleRotate}
            />
            <IconButton onClick={download} sx={{ color: 'white' }}>
              <DownloadIcon
                sx={{
                  fontSize: 30,
                  '&:hover': { color: 'rgba(255, 255, 255, 0.3)' },
                }}
              />
            </IconButton>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon
              sx={{
                fontSize: 30,
                '&:hover': { color: 'rgba(255, 255, 255, 0.3)' },
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          position: 'relative',
        }}
      >
        <Box
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'center',
            gap: 2,
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
            position: 'relative',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <NavigationButtons
            type={type}
            currentPdfPage={currentPdfPage}
            numPages={numPages}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <Box
            sx={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
              transformOrigin: 'center center',
              padding: '50px',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ViewerContent
              type={type}
              file={fileConfig}
              currentPdfPage={currentPdfPage}
              onPdfLoad={(pdf) => {
                setNumPages(pdf.numPages)
                pdfInstanceRef.current = pdf
              }}
              thumbnailUrl={thumbnailUrl}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </Box>
        </Box>

        {type === ViewerType.PDF && numPages > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: '1rem 0',
            }}
          >
            <IconButton
              onClick={handlePreviousPDFPage}
              disabled={currentPdfPage === 1}
              sx={{
                color: 'white',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body1" sx={{ color: 'white' }}>
              Sida {currentPdfPage} av {numPages}
            </Typography>
            <IconButton
              onClick={handleNextPDFPage}
              disabled={currentPdfPage === numPages}
              sx={{
                color: 'white',
                '&.Mui-disabled': {
                  color: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  )
}
