import { Button, Box } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { NavigationButtonsProps } from '../../../../../common/types'

export const NavigationButtons = ({
  isPdf,
  currentPdfPage,
  numPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: NavigationButtonsProps) => (
  <Box sx={{ zIndex: 1301 }}>
    <Button
      onClick={onPrevious}
      disabled={isPdf ? currentPdfPage <= 1 && !hasPrevious : !hasPrevious}
      sx={{
        color: 'white',
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        '&.Mui-disabled': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        left: '20px',
      }}
    >
      <ChevronLeftIcon sx={{ fontSize: 40 }} />
    </Button>
    <Button
      onClick={onNext}
      disabled={isPdf ? currentPdfPage >= numPages && !hasNext : !hasNext}
      sx={{
        color: 'white',
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        '&.Mui-disabled': {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        right: '20px',
      }}
    >
      <ChevronRightIcon sx={{ fontSize: 40 }} />
    </Button>
  </Box>
)
