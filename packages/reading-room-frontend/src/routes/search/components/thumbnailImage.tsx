import { useState } from 'react'
import { Box } from '@mui/material'
import ImageIcon from '@mui/icons-material/Image'
import AudioIcon from '@mui/icons-material/AudioFile'
import VideoIcon from '@mui/icons-material/VideoFile'
import PdfIcon from '@mui/icons-material/PictureAsPdf'
import OtherIcon from '@mui/icons-material/FilePresent'

import { ThumbnailImageProps } from '../../../common/types'

export const ThumbnailImage = ({
  document,
  searchUrl,
}: ThumbnailImageProps) => {
  const [hasError, setHasError] = useState(false)
  const src = document.pages[0].thumbnailUrl
    ? `${searchUrl}/document/${document.id}/thumbnail`
    : null
  const pageType = document.pages[0].pageType
  const icons = {
    image: (props: { width: string; color: string }) => (
      <ImageIcon
        sx={{ width: props.width, height: 'auto', color: props.color }}
      />
    ),
    audio: (props: { width: string; color: string }) => (
      <AudioIcon
        sx={{ width: props.width, height: 'auto', color: props.color }}
      />
    ),
    film: (props: { width: string; color: string }) => (
      <VideoIcon
        sx={{ width: props.width, height: 'auto', color: props.color }}
      />
    ),
    pdf: (props: { width: string; color: string }) => (
      <PdfIcon
        sx={{ width: props.width, height: 'auto', color: props.color }}
      />
    ),
    unknown: (props: { width: string; color: string }) => (
      <OtherIcon
        sx={{ width: props.width, height: 'auto', color: props.color }}
      />
    ),
  }

  if (!src || hasError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          backgroundColor: '#F5F5F5',
          aspectRatio: '1/1',
          width: '100%',
        }}
      >
        {(
          icons[pageType.toLowerCase() as keyof typeof icons] ||
          icons['unknown']
        )({
          width: '50%',
          color: '#CCCCCC',
        })}
      </Box>
    )
  }

  return (
    <Box position="relative">
      <img
        src={src}
        style={{
          width: '100%',
          aspectRatio: '1/1',
          objectFit: 'cover',
        }}
        alt="Liten bild för dokumentet"
        onError={() => setHasError(true)}
      />
      <Box
        sx={{
          borderBottomRightRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '5px',
          width: '45px',
          height: '45px',
          position: 'absolute',
          top: '0px',
          left: '0px',
          backgroundColor: 'rgba(255, 255, 255)',
        }}
      >
        {(
          icons[pageType.toLowerCase() as keyof typeof icons] ||
          icons['unknown']
        )({
          width: '100%',
          color: 'primary.main',
        })}
      </Box>
    </Box>
  )
}
