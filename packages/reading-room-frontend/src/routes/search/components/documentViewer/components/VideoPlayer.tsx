import { useState } from 'react'
import { Box, Typography } from '@mui/material'

import { VideoPlayerProps } from '../../../../../common/types'

export const VideoPlayer = ({ file, scale, rotation }: VideoPlayerProps) => {
  const [playbackFailed, setPlaybackFailed] = useState(false)

  if (file.url.endsWith('.flv')) {
    return (
      <Typography variant="h6" sx={{ color: 'white' }}>
        Denna filtyp stöds inte för uppspelning i webbläsaren. Ladda ner filen
        för att se den.
      </Typography>
    )
  }

  if (playbackFailed) {
    return (
      <Typography variant="h6" sx={{ color: 'white' }}>
        Filen kunde inte spelas upp. Ladda ner filen för att se den.
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
        onError={() => setPlaybackFailed(true)}
      >
        {/* A fetch failure fires 'error' on the <source>, a decode failure on
            the media element itself, so both need the handler. */}
        <source src={file.url} onError={() => setPlaybackFailed(true)} />
        Din webbläsare stödjer inte videouppspelning.
      </video>
    </Box>
  )
}
