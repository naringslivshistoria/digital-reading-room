import { Box, Typography } from '@mui/material'

import { VideoPlayerProps } from '../../../../../common/types'

export const VideoPlayer = ({ file, scale, rotation }: VideoPlayerProps) => {
  if (file.url.endsWith('.flv')) {
    return (
      <Typography variant="h6" sx={{ color: 'white' }}>
        Denna filtyp stöds inte för uppspelning i webbläsaren. Ladda ner filen
        för att se den.
      </Typography>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* No caption track: archived videos have no caption resources, and
          pointing one at the video URL triggers a failing transcode fetch. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        controls
        playsInline
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          transform: `scale(${scale || 1}) rotate(${rotation || 0}deg)`,
        }}
        controlsList="nodownload"
      >
        <source src={file.url} />
        Din webbläsare stödjer inte videouppspelning.
      </video>
    </Box>
  )
}
