import CircularProgress from '@mui/material/CircularProgress'

interface LoadingIndicatorProps {
  size?: number
}

export function LoadingIndicator({
  size = 20,
}: LoadingIndicatorProps) {
  return (
    <span className="loading-indicator" aria-hidden="true">
      <CircularProgress color="inherit" size={size} thickness={4.5} />
    </span>
  )
}
