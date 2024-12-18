import { useState, useRef, useEffect, useMemo } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { CircularProgress } from '@mui/material'
import { pdfjs } from 'react-pdf'
import { ZoomControls } from './components/ZoomControls'
import { NavigationButtons } from './components/NavigationButtons'
import { ViewerContent } from './components/ViewerContent'
import { DocumentViewerProps } from '../../../../common/types'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function DocumentViewer({
  file,
  isPdf,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: DocumentViewerProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [currentPdfPage, setCurrentPdfPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [pdfInstance, setPdfInstance] = useState<any>(null)
  const [isImageLoading, setIsImageLoading] = useState(true)

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
    setPdfInstance(null)
    if (!isPdf) {
      setIsImageLoading(true)
    }
  }, [file, isPdf])

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
    const newScale = Math.min(scale + 0.5, 5)
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1)
    setScale(newScale)
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handlePrevious = () => {
    if (isPdf) {
      if (currentPdfPage <= 1 && onPrevious) {
        handleReset()
        onPrevious()
      } else {
        handleReset()
        setCurrentPdfPage((prev) => Math.max(prev - 1, 1))
      }
    } else {
      handleReset()
      onPrevious?.()
    }
  }

  const handleNext = () => {
    if (isPdf) {
      if (currentPdfPage >= numPages && onNext) {
        handleReset()
        setCurrentPdfPage(1)
        onNext()
      } else {
        handleReset()
        setCurrentPdfPage((prev) => Math.min(prev + 1, numPages))
      }
    } else {
      handleReset()
      onNext?.()
    }
  }

  useEffect(() => {
    return () => {
      if (pdfInstance) {
        pdfInstance.destroy().catch((error: Error) => {
          console.error('Error destroying PDF instance:', error)
        })
      }
    }
  }, [pdfInstance])

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: 1300,
        overflow: 'hidden',
        padding: '2rem',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1301,
          display: 'flex',
          gap: 2,
        }}
      >
        <ZoomControls
          scale={scale}
          position={position}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>

      {isPdf && numPages > 0 && (
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Sida {currentPdfPage} av {numPages}
        </Typography>
      )}

      <Box
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        sx={{
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: 'calc(100vh - 100px)',
          justifyContent: 'center',
          gap: 2,
          overflow: 'hidden',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
        }}
      >
        {!isPdf && isImageLoading && (
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
          isPdf={isPdf}
          currentPdfPage={currentPdfPage}
          numPages={numPages}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <Box
          sx={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging
              ? 'none'
              : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center center',
            padding: '50px',
          }}
        >
          <ViewerContent
            isPdf={isPdf}
            file={fileConfig}
            currentPdfPage={currentPdfPage}
            isImageLoading={isImageLoading}
            onPdfLoad={(pdf) => {
              setNumPages(pdf.numPages)
              setPdfInstance(pdf)
            }}
            onImageLoad={() => setIsImageLoading(false)}
            onImageError={() => setIsImageLoading(false)}
          />
        </Box>
      </Box>
    </Box>
  )
}
