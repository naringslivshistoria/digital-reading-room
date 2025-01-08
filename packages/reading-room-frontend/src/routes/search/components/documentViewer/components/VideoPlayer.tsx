import { Box } from '@mui/material'
import { VideoPlayerProps } from '../../../../../common/types'

export const VideoPlayer = ({ file }: VideoPlayerProps) => {
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
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      >
        <source src={file.url} type="video/mp4" />
        Din webbläsare stödjer inte videouppspelning.
      </video>
    </Box>
  )
}
