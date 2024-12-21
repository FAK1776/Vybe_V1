import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingAnimation({ message = 'Loading...' }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(10, 25, 41, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'primary.main',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingAnimation; 