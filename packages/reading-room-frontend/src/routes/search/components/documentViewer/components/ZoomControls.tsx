import { Box, IconButton } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

interface ZoomControlsProps {
  scale: number
  position: { x: number; y: number }
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export const ZoomControls = ({
  scale,
  position,
  onZoomIn,
  onZoomOut,
  onReset,
}: ZoomControlsProps) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <IconButton
      onClick={onZoomIn}
      sx={{
        color: scale >= 5 ? 'rgba(255, 255, 255, 0.3)' : 'white',
      }}
    >
      <ZoomInIcon sx={{ fontSize: 30 }} />
    </IconButton>
    <IconButton
      onClick={onZoomOut}
      sx={{
        color: scale <= 1 ? 'rgba(255, 255, 255, 0.3)' : 'white',
      }}
    >
      <ZoomOutIcon sx={{ fontSize: 30 }} />
    </IconButton>
    <IconButton
      onClick={onReset}
      sx={{
        color:
          scale === 1 && position.x === 0 && position.y === 0
            ? 'rgba(255, 255, 255, 0.3)'
            : 'white',
      }}
    >
      <RestartAltIcon sx={{ fontSize: 30 }} />
    </IconButton>
  </Box>
)
