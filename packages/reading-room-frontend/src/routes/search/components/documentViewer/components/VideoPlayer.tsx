import { Box, Typography } from '@mui/material'

import { VideoPlayerProps } from '../../../../../common/types'

export const VideoPlayer = ({ file }: VideoPlayerProps) => {
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
      <video
        controls
        playsInline
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
        controlsList="nodownload"
      >
        <source src={file.url} type="video/mp4" />
        <track kind="captions" src={file.url} srcLang="en" label="English" />
        Din webbläsare stödjer inte videouppspelning.
      </video>
    </Box>
  )
}
