import { useState, useRef, useEffect, useMemo } from 'react'
import { Box, IconButton, Typography, Button } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CloseIcon from '@mui/icons-material/Close'
import CircularProgress from '@mui/material/CircularProgress'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Document as PdfDocument, Page as PdfPage, pdfjs } from 'react-pdf'
import { PdfViewerProps } from '../../../common/types'
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export default function PdfViewer({ pdfFile, onClose }: PdfViewerProps) {
  const [scale, setScale] = useState(1)
  const [pdfPosition, setPdfPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const [currentPdfPage, setCurrentPdfPage] = useState(1)
  const [numPages, setNumPages] = useState(0)

  const [pdfInstance, setPdfInstance] = useState<any>(null)

  const fileConfig = useMemo(
    () => ({
      url: pdfFile,
      withCredentials: true,
    }),
    [pdfFile]
  )

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault()
      const newScale = scale + (e.deltaY > 0 ? -0.1 : 0.1)
      setScale(Math.min(Math.max(0.5, newScale), 3))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setStartDragPosition({
        x: e.clientX - pdfPosition.x,
        y: e.clientY - pdfPosition.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = e.clientX - startDragPosition.x
      const newY = e.clientY - startDragPosition.y
      setPdfPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
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
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <IconButton
            onClick={() => {
              const newScale = Math.min(scale + 0.1, 3)
              setScale(newScale)
            }}
          >
            <ZoomInIcon color="secondary" sx={{ fontSize: 30 }} />
          </IconButton>
          <IconButton
            onClick={() => {
              const newScale = Math.max(scale - 0.1, 0.5)
              setScale(newScale)
            }}
          >
            <ZoomOutIcon color="secondary" sx={{ fontSize: 30 }} />
          </IconButton>
          <IconButton
            onClick={() => {
              setScale(1)
              setPdfPosition({ x: 0, y: 0 })
            }}
          >
            <RestartAltIcon color="secondary" sx={{ fontSize: 30 }} />
          </IconButton>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon color="secondary" />
        </IconButton>
      </Box>
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
      <PdfDocument
        file={fileConfig}
        onLoadError={(error) => console.error('PDF-laddningsfel:', error)}
        onSourceError={(error) => console.error('PDF-källfel:', error)}
        onLoadSuccess={(pdf) => {
          setNumPages(pdf.numPages)
          setPdfInstance(pdf)
        }}
        loading={
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <CircularProgress />
          </Box>
        }
        error={<p>Kunde inte ladda PDF...</p>}
      >
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
            cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
            overflow: 'hidden',
          }}
        >
          <Button
            onClick={() => setCurrentPdfPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPdfPage <= 1}
            sx={{
              color: 'white',
              position: 'fixed',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 40 }} />
          </Button>

          <Box
            sx={{
              transform: `scale(${scale}) translate(${pdfPosition.x}px, ${pdfPosition.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s',
            }}
          >
            <PdfPage
              pageNumber={currentPdfPage}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Box>

          <Button
            onClick={() =>
              setCurrentPdfPage((prev) => Math.min(prev + 1, numPages))
            }
            disabled={currentPdfPage >= numPages}
            sx={{
              color: 'white',
              position: 'fixed',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 40 }} />
          </Button>
        </Box>
      </PdfDocument>
    </Box>
  )
}
