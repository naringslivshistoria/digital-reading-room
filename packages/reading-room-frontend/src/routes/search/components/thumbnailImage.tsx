import { useState } from 'react'
import { Box } from '@mui/material'

import { DocumentIcon } from './documentIcon'
import { ThumbnailImageProps } from '../../../common/types'

export const ThumbnailImage = ({
  thumbnailUrl,
  pageType,
  showIcon = true,
  style,
}: ThumbnailImageProps) => {
  const [hasError, setHasError] = useState(false)
  const src = thumbnailUrl

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
          DocumentIcon[pageType.toLowerCase() as keyof typeof DocumentIcon] ||
          DocumentIcon['unknown']
        )({
          width: '50%',
          color: '#CCCCCC',
        })}
      </Box>
    )
  }

  return (
    <Box position="relative" sx={{ width: '100%', height: '100%' }}>
      <img
        src={src}
        style={style}
        alt="Liten bild för dokumentet"
        onError={() => {
          setHasError(true)
        }}
      />
      {showIcon && (
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
            DocumentIcon[pageType.toLowerCase() as keyof typeof DocumentIcon] ||
            DocumentIcon['unknown']
          )({
            width: '100%',
            color: 'primary.main',
          })}
        </Box>
      )}
    </Box>
  )
}
