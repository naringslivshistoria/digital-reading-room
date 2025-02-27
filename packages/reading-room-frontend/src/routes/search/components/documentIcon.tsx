import ImageIcon from '@mui/icons-material/Image'
import AudioIcon from '@mui/icons-material/AudioFile'
import VideoIcon from '@mui/icons-material/VideoFile'
import PdfIcon from '@mui/icons-material/PictureAsPdf'
import OtherIcon from '@mui/icons-material/FilePresent'

export const DocumentIcon = {
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
    <PdfIcon sx={{ width: props.width, height: 'auto', color: props.color }} />
  ),
  unknown: (props: { width: string; color: string }) => (
    <OtherIcon
      sx={{ width: props.width, height: 'auto', color: props.color }}
    />
  ),
}
