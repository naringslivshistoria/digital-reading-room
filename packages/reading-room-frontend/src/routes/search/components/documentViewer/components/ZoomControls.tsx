import { Box, IconButton } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw'

import { ZoomControlsProps } from '../../../../../common/types'

export const ZoomControls = ({
  scale,
  position,
  onZoomIn,
  onZoomOut,
  onReset,
  onRotate,
}: ZoomControlsProps) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <IconButton
      onClick={onZoomIn}
      sx={{
        color: scale >= 5 ? 'rgba(255, 255, 255, 0.3)' : 'white',
        '&:hover': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <ZoomInIcon sx={{ fontSize: 30 }} />
    </IconButton>
    <IconButton
      onClick={onZoomOut}
      sx={{
        color: scale <= 1 ? 'rgba(255, 255, 255, 0.3)' : 'white',
        '&:hover': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <ZoomOutIcon sx={{ fontSize: 30 }} />
    </IconButton>
    <IconButton onClick={onRotate} sx={{ color: 'white' }}>
      <Rotate90DegreesCwIcon
        sx={{
          fontSize: 30,
          '&:hover': { color: 'rgba(255, 255, 255, 0.3)' },
        }}
      />
    </IconButton>
    <IconButton
      onClick={onReset}
      sx={{
        color:
          scale === 1 && position.x === 0 && position.y === 0
            ? 'rgba(255, 255, 255, 0.3)'
            : 'white',
        '&:hover': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
      }}
    >
      <RestartAltIcon sx={{ fontSize: 30 }} />
    </IconButton>
  </Box>
)
